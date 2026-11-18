// Regressões do motor de fluxo (js/flow-engine.js), rodadas num DOM mínimo
// em memória: o motor só usa createElement, filhos, atributos e eventos.
//
// Motivos:
//  1. "Refazer" só zerava stepIndex; a rodada nova abria com as respostas da
//     anterior já marcadas e passava pela validação sem nada respondido.
//  2. Resposta de um campo que ficou oculto por showIf (o usuário voltou e
//     trocou de ramo) chegava ao buildReport.
//  3. Campo number/text que muda a visibilidade não re-renderizava o passo.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/flow-engine.js", import.meta.url), "utf8");

class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = "";
    this.ownText = "";
    this.dataset = {};
    this.style = {};
    this.value = "";
  }
  get textContent() {
    return this.ownText + this.children.map((child) => child.textContent).join("");
  }
  set textContent(text) {
    this.ownText = String(text);
    this.children = [];
  }
  get classList() {
    const names = () => this.className.split(/\s+/).filter(Boolean);
    return {
      contains: (name) => names().includes(name),
      add: (name) => { if (!names().includes(name)) this.className = [...names(), name].join(" "); },
      remove: (name) => { this.className = names().filter((n) => n !== name).join(" "); },
      toggle: (name, on) => {
        const want = on === undefined ? !names().includes(name) : on;
        this.className = names().filter((n) => n !== name).concat(want ? [name] : []).join(" ");
      },
    };
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  replaceChildren(...children) {
    this.children = children;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  getAttribute(name) {
    return name in this.attributes ? this.attributes[name] : null;
  }
  addEventListener(type, handler) {
    (this.listeners[type] ||= []).push(handler);
  }
  fire(type) {
    (this.listeners[type] || []).forEach((handler) => handler({ target: this }));
  }
  click() {
    this.fire("click");
  }
  descendants() {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }
  querySelectorAll(tag) {
    return this.descendants().filter((element) => element.tagName === tag.toUpperCase());
  }
}

function startFlow(flow) {
  const alerts = [];
  const context = vm.createContext({
    document: { createElement: (tag) => new FakeElement(tag) },
    alert: (message) => alerts.push(message),
    track: () => {},
    isCommunityConfigured: () => false,
    CONFIG: {},
  });
  vm.runInContext(source, context);
  const root = new FakeElement("div");
  context.renderFlow(root, flow);

  const all = () => root.descendants();
  const byClass = (name) => all().filter((element) => element.classList.contains(name));
  const button = (text) => {
    const found = all().find((element) => element.tagName === "BUTTON" && element.textContent.trim() === text);
    assert.ok(found, `botão "${text}" não encontrado`);
    return found;
  };
  return {
    alerts,
    title: () => all().find((element) => element.tagName === "H2").textContent,
    choose: (label) => button(label).click(),
    next: () => byClass("btn-primary")[0].click(),
    redo: () => button("Refazer").click(),
    marked: () => byClass("choice-row").filter((row) => row.getAttribute("aria-pressed") === "true").map((row) => row.textContent),
    fieldLabels: () => byClass("control-label").map((label) => label.children[0].textContent),
    input: () => all().find((element) => element.tagName === "INPUT"),
  };
}

function makeFlow(reports) {
  return {
    steps: [
      {
        title: "Passo 1",
        fields: [
          { id: "rota", label: "Rota", type: "radio", required: true, options: [{ value: "a", label: "Rota A" }, { value: "b", label: "Rota B" }] },
          { id: "detalhe", label: "Detalhe da rota A", type: "radio", required: true, showIf: (a) => a.rota === "a", options: ["X", "Y"] },
        ],
      },
      {
        title: "Passo 2",
        fields: [
          { id: "valor", label: "Valor", type: "number" },
          { id: "extra", label: "Extra", type: "radio", showIf: (a) => a.valor > 100, options: ["Sim", "Não"] },
          { id: "nivel", label: "Nível", type: "radio", value: "medio", options: [{ value: "baixo", label: "Baixo" }, { value: "medio", label: "Médio" }, { value: "alto", label: "Alto" }] },
        ],
      },
    ],
    buildReport(answers) {
      reports.push({ ...answers });
      return { headline: "ok", plan: [] };
    },
  };
}

// 1. Refazer volta às respostas iniciais (só os defaults do flow).
{
  const reports = [];
  const ui = startFlow(makeFlow(reports));
  ui.choose("Rota B");
  ui.next();
  ui.input().value = "50";
  ui.input().fire("input");
  ui.choose("Alto");
  ui.next();
  assert.equal(reports.length, 1);
  assert.deepEqual(reports[0], { rota: "b", valor: 50, nivel: "alto" });

  ui.redo();
  assert.equal(ui.title(), "Passo 1");
  assert.deepEqual(ui.marked(), [], "Refazer não pode abrir com a rodada anterior marcada");
  ui.next();
  assert.deepEqual(ui.alerts, ["Preencha: Rota"], "pergunta obrigatória precisa ser respondida de novo");

  ui.choose("Rota B");
  ui.next();
  assert.equal(ui.input().value, "", "campo de texto/número volta vazio");
  assert.deepEqual(ui.marked(), ["Médio"], "campo com default volta ao default, não à resposta anterior");
}

// 2. Resposta de campo oculto por showIf não chega ao relatório.
{
  const reports = [];
  const ui = startFlow(makeFlow(reports));
  ui.choose("Rota A");
  ui.choose("X");
  ui.choose("Rota B");
  assert.deepEqual(ui.fieldLabels(), ["Rota"], "o detalhe da rota A some ao trocar de rota");
  ui.next();
  ui.next();
  assert.equal(reports.length, 1);
  assert.ok(!("detalhe" in reports[0]), "resposta do ramo abandonado chegou ao buildReport");
  assert.equal(reports[0].nivel, "medio");
}

// 3. Number que muda a visibilidade re-renderiza o passo no "change".
{
  const reports = [];
  const ui = startFlow(makeFlow(reports));
  ui.choose("Rota B");
  ui.next();
  assert.deepEqual(ui.fieldLabels(), ["Valor", "Nível"]);
  ui.input().value = "500";
  ui.input().fire("input");
  ui.input().fire("change");
  assert.deepEqual(ui.fieldLabels(), ["Valor", "Extra", "Nível"], "campo condicionado ao valor não apareceu");
  assert.equal(String(ui.input().value), "500", "o valor digitado continua no campo depois de re-renderizar");
}

console.log("flow-engine: ok");

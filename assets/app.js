(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

  const esc = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const fmtNum = (value) => {
    if (value === "" || value == null || Number.isNaN(Number(value))) return "—";
    return nf.format(Number(value));
  };

  const inputNumber = (value) => {
    if (value === "" || value == null) return "";
    return String(value).replace(".", ",");
  };

  const parseInput = (raw) => {
    let text = String(raw == null ? "" : raw).trim().replace(/\s/g, "");
    if (!text) return "";
    if (text.includes(",")) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
      text = text.replace(/\./g, "");
    }
    const n = Number(text);
    return Number.isFinite(n) ? n : "";
  };

  const fmtValue = (criterion, value) => {
    if (value === "" || value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    switch (criterion.unit) {
      case "%":
        return `${fmtNum(n)}%`;
      case "x":
        return `${fmtNum(n)}x`;
      case "R$ mil":
        return `R$ ${fmtNum(n)} mil`;
      case "R$ mi":
        return `R$ ${fmtNum(n)} mi`;
      default:
        return fmtNum(n);
    }
  };

  const optionLabel = (criterion, value) => {
    const option = (criterion.options || []).find((item) => item.value === value);
    return option ? option.label : value;
  };

  const formatCriterion = (criterion, value, op) => {
    if (criterion.type === "select") {
      return optionLabel(criterion, value);
    }
    if (criterion.type === "text") {
      return String(value || "").trim();
    }
    return `${op} ${fmtValue(criterion, value)}`;
  };

  const formatCriterionForCopy = (criterion, value, op) => {
    if (criterion.type === "select") {
      return `${criterion.label}: ${optionLabel(criterion, value)}`;
    }
    if (criterion.type === "text") {
      return `${criterion.label}: ${String(value || "").trim()}`;
    }
    return `${criterion.label} ${op} ${fmtValue(criterion, value)}`;
  };

  const FII_TYPES = [
    { value: "todos", label: "Todos" },
    { value: "tijolo", label: "Tijolo" },
    { value: "papel", label: "Papel" },
    { value: "fofs", label: "Fundo de fundos" },
    { value: "misto", label: "Misto / híbrido" },
    { value: "desenvolvimento", label: "Desenvolvimento" },
    { value: "outros", label: "Outros" }
  ];

  const FII_SEGMENTS = [
    { value: "todos", label: "Todos" },
    { value: "logistico", label: "Logístico / galpões" },
    { value: "shoppings-varejo", label: "Shoppings / varejo" },
    { value: "lajes-corporativas", label: "Lajes corporativas" },
    { value: "tit-e-val-mob", label: "Papel / TVM" },
    { value: "hibrido", label: "Híbrido" },
    { value: "fiagros", label: "Fiagro" },
    { value: "fundo-de-fundos", label: "Fundo de fundos" },
    { value: "residencial", label: "Residencial" },
    { value: "hospitalar", label: "Hospitalar" },
    { value: "hoteis", label: "Hotéis" },
    { value: "agencias-bancarias", label: "Agências bancárias" },
    { value: "educacional", label: "Educacional" },
    { value: "fi-infra", label: "FI-Infra" },
    { value: "fip", label: "FIP" },
    { value: "outros", label: "Outros" }
  ];

  const DATASETS = {
    fii: {
      label: "FIIs",
      singular: "FII",
      baseUrl: "https://investidor10.com.br/fiis/",
      defaultPreset: "renda",
      styleNote:
        "Trocar de estilo recomeça os valores. FIIs não têm um método equivalente aos investidores famosos; estes estilos são pontos de partida para a sua própria análise.",
      styleGroups: [
        {
          label: "Objetivo",
          keys: ["renda", "valor", "seguranca", "constancia"]
        }
      ],
      criteria: [
        {
          key: "pvp",
          label: "P/VP",
          group: "Valor",
          type: "number",
          op: "≤",
          defaultValue: 1,
          unit: "x",
          step: 0.05,
          desc: "Preço dividido pelo valor patrimonial. Abaixo de 1, o fundo negocia com desconto."
        },
        {
          key: "dy12",
          label: "Dividend Yield 12m",
          group: "Renda",
          type: "number",
          op: "≥",
          defaultValue: 8,
          unit: "%",
          step: 0.5,
          desc: "Proventos dos últimos 12 meses divididos pelo preço atual."
        },
        {
          key: "dy5",
          label: "DY médio 5 anos",
          group: "Constância",
          type: "number",
          op: "≥",
          defaultValue: 7,
          unit: "%",
          step: 0.5,
          desc: "Média de proventos dos últimos cinco anos. Separa renda recorrente de evento pontual."
        },
        {
          key: "liq",
          label: "Liquidez diária",
          group: "Segurança",
          type: "number",
          op: "≥",
          defaultValue: 300,
          unit: "R$ mil",
          step: 50,
          desc: "Volume médio negociado por dia. Mais liquidez facilita entrar e sair sem mexer no preço."
        },
        {
          key: "patrimonio",
          label: "Patrimônio líquido",
          group: "Segurança",
          type: "number",
          op: "≥",
          defaultValue: 500,
          unit: "R$ mi",
          step: 100,
          desc: "Tamanho do fundo. Fundos muito pequenos podem sofrer mais com resgates e ter menos liquidez."
        },
        {
          key: "tipo",
          label: "Tipo de fundo",
          group: "Segurança",
          type: "select",
          defaultValue: "todos",
          options: FII_TYPES,
          desc: "Tijolo, papel, fundo de fundos, misto ou desenvolvimento. Cada tipo tem riscos diferentes."
        },
        {
          key: "segmento",
          label: "Segmento",
          group: "Foco",
          type: "select",
          defaultValue: "todos",
          options: FII_SEGMENTS,
          desc: "Filtra o segmento de atuação. Use junto com o tipo quando quiser um recorte mais específico."
        }
      ],
      manuals: [
        {
          key: "vacancia",
          label: "Vacância física ≤ 10%",
          desc: "Veja o relatório gerencial. Vacância alta pressiona o rendimento e pode exigir reinvestimento."
        },
        {
          key: "contratos",
          label: "Contratos e inquilinos saudáveis",
          desc: "Confira prazo, reajuste, concentração e qualidade dos principais inquilinos."
        },
        {
          key: "gestao",
          label: "Gestora com histórico e governança",
          desc: "Avalie track record, transparência, taxa de administração e alinhamento."
        },
        {
          key: "historico",
          label: "Histórico de proventos",
          desc: "Verifique a consistência dos pagamentos e se houve interrupções relevantes."
        }
      ],
      presets: [
        {
          key: "renda",
          name: "Renda",
          mark: "R$",
          desc: "DY alto e recorrência.",
          enabled: ["pvp", "dy12", "dy5", "liq", "patrimonio"],
          manual: ["vacancia", "contratos", "historico"],
          values: {
            pvp: 1.05,
            dy12: 9,
            dy5: 7,
            liq: 300,
            patrimonio: 300
          }
        },
        {
          key: "valor",
          name: "Valor",
          mark: "↓",
          desc: "Desconto com liquidez.",
          enabled: ["pvp", "dy12", "dy5", "liq", "patrimonio"],
          manual: ["vacancia", "contratos"],
          values: {
            pvp: 0.9,
            dy12: 7,
            dy5: 6,
            liq: 300,
            patrimonio: 500
          }
        },
        {
          key: "seguranca",
          name: "Segurança",
          mark: "SG",
          desc: "Liquidez, tamanho e qualidade.",
          enabled: ["pvp", "dy12", "dy5", "liq", "patrimonio"],
          manual: ["vacancia", "contratos", "gestao"],
          values: {
            pvp: 1,
            dy12: 7,
            dy5: 6.5,
            liq: 500,
            patrimonio: 1000
          }
        },
        {
          key: "constancia",
          name: "Constância",
          mark: "↻",
          desc: "Histórico de proventos.",
          enabled: ["pvp", "dy12", "dy5", "liq", "patrimonio"],
          manual: ["vacancia", "contratos", "gestao", "historico"],
          values: {
            pvp: 1.1,
            dy12: 6,
            dy5: 8,
            liq: 300,
            patrimonio: 500
          }
        }
      ]
    },

    acao: {
      label: "Ações",
      singular: "Ação",
      baseUrl: "https://investidor10.com.br/acoes/",
      defaultPreset: "buffett",
      styleNote:
        "Trocar de estilo recomeça os valores. Os métodos são adaptações educacionais de ideias públicas, não oficiais nem recomendação de investimento.",
      styleGroups: [
        {
          label: "Métodos de investidores",
          keys: ["graham", "buffett", "lynch", "barsi", "bazin", "fisher"]
        },
        {
          label: "Ponto de partida",
          keys: ["equilibrado"]
        }
      ],
      criteria: [
        {
          key: "pl",
          label: "P/L",
          group: "Valor",
          type: "number",
          op: "≤",
          defaultValue: 15,
          unit: "x",
          step: 1,
          desc: "Preço dividido pelo lucro por ação. Mostra quantos anos de lucro, no ritmo atual, o preço representa."
        },
        {
          key: "pvp",
          label: "P/VP",
          group: "Valor",
          type: "number",
          op: "≤",
          defaultValue: 1.5,
          unit: "x",
          step: 0.1,
          desc: "Preço sobre o patrimônio. Abaixo de 1, a ação negocia abaixo do valor contábil."
        },
        {
          key: "dy12",
          label: "Dividend Yield 12m",
          group: "Renda",
          type: "number",
          op: "≥",
          defaultValue: 6,
          unit: "%",
          step: 0.5,
          desc: "Proventos dos últimos 12 meses divididos pelo preço atual."
        },
        {
          key: "dy5",
          label: "DY médio 5 anos",
          group: "Constância",
          type: "number",
          op: "≥",
          defaultValue: 5,
          unit: "%",
          step: 0.5,
          desc: "Média de proventos dos últimos cinco anos. Ajuda a ver se a renda é recorrente."
        },
        {
          key: "roe",
          label: "ROE",
          group: "Qualidade",
          type: "number",
          op: "≥",
          defaultValue: 15,
          unit: "%",
          step: 1,
          desc: "Retorno sobre o patrimônio. Mede a eficiência do capital próprio da empresa."
        },
        {
          key: "margem",
          label: "Margem líquida",
          group: "Qualidade",
          type: "number",
          op: "≥",
          defaultValue: 10,
          unit: "%",
          step: 1,
          desc: "Quanto sobra de lucro para cada real de receita."
        },
        {
          key: "divida",
          label: "Dívida bruta / patrimônio",
          group: "Segurança",
          type: "number",
          op: "≤",
          defaultValue: 1,
          unit: "x",
          step: 0.1,
          desc: "Quanto a empresa deve em relação ao seu patrimônio. Mais dívida aumenta o risco."
        },
        {
          key: "crescReceita",
          label: "Crescimento da receita 5a",
          group: "Crescimento",
          type: "number",
          op: "≥",
          defaultValue: 8,
          unit: "%",
          step: 1,
          desc: "Crescimento médio anual da receita nos últimos cinco anos."
        },
        {
          key: "crescLucro",
          label: "Crescimento do lucro 5a",
          group: "Crescimento",
          type: "number",
          op: "≥",
          defaultValue: 8,
          unit: "%",
          step: 1,
          desc: "Crescimento médio anual do lucro nos últimos cinco anos."
        },
        {
          key: "setor",
          label: "Setor (opcional)",
          group: "Foco",
          type: "text",
          defaultValue: "",
          placeholder: "Ex.: energia, bancos, tecnologia",
          desc: "Campo livre para lembrar o setor que você quer priorizar. Use a busca da plataforma para aplicar."
        }
      ],
      manuals: [
        {
          key: "graham",
          label: "Preço atual ≤ Preço Justo de Graham",
          desc: "O Investidor10 mostra a coluna “Preço Justo de Graham”. Confira se o preço está abaixo."
        },
        {
          key: "bazin",
          label: "Preço atual ≤ Preço-teto de Bazin",
          desc: "O Investidor10 mostra a coluna “Preço-teto de Bazin”. Compare com o preço atual."
        },
        {
          key: "payout",
          label: "Payout sustentável",
          desc: "Proventos distribuídos não devem consumir mais que o lucro recorrente."
        },
        {
          key: "governanca",
          label: "Governança e vantagem competitiva",
          desc: "Avalie gestão, setor, vantagens competitivas e riscos do negócio."
        },
        {
          key: "peg",
          label: "PEG ≤ 1 (P/L ÷ crescimento)",
          desc: "Calcule manualmente: P/L dividido pelo crescimento esperado do lucro."
        },
        {
          key: "setorPerene",
          label: "Setor perene e empresa líder",
          desc: "Para renda no longo prazo, prefira setores estáveis e empresas com posição forte."
        }
      ],
      presets: [
        {
          key: "graham",
          name: "Benjamin Graham",
          mark: "BG",
          desc: "Margem de segurança e preço baixo.",
          enabled: ["pl", "pvp", "divida"],
          manual: ["graham", "governanca"],
          values: {
            pl: 15,
            pvp: 1.5,
            divida: 1
          }
        },
        {
          key: "buffett",
          name: "Warren Buffett",
          mark: "WB",
          desc: "Qualidade, lucro e dívida controlada.",
          enabled: ["pl", "roe", "margem", "divida", "crescLucro"],
          manual: ["governanca"],
          values: {
            pl: 25,
            roe: 15,
            margem: 10,
            divida: 1,
            crescLucro: 8
          }
        },
        {
          key: "lynch",
          name: "Peter Lynch",
          mark: "PL",
          desc: "Crescimento com preço razoável.",
          enabled: ["pl", "roe", "divida", "crescLucro"],
          manual: ["peg", "governanca"],
          values: {
            pl: 20,
            roe: 12,
            divida: 1,
            crescLucro: 15
          }
        },
        {
          key: "barsi",
          name: "Luiz Barsi",
          mark: "LB",
          desc: "Renda e consistência de dividendos.",
          enabled: ["pl", "dy12", "dy5", "divida"],
          manual: ["bazin", "payout", "setorPerene"],
          values: {
            pl: 15,
            dy12: 6,
            dy5: 5,
            divida: 1
          }
        },
        {
          key: "bazin",
          name: "Décio Bazin",
          mark: "DB",
          desc: "Dividendos e preço-teto.",
          enabled: ["dy12", "dy5", "divida"],
          manual: ["bazin", "payout"],
          values: {
            dy12: 6,
            dy5: 5,
            divida: 1
          }
        },
        {
          key: "fisher",
          name: "Philip Fisher",
          mark: "PF",
          desc: "Qualidade e crescimento de longo prazo.",
          enabled: ["roe", "margem", "divida", "crescReceita", "crescLucro"],
          manual: ["governanca"],
          values: {
            roe: 15,
            margem: 10,
            divida: 1,
            crescReceita: 10,
            crescLucro: 10
          }
        },
        {
          key: "equilibrado",
          name: "Equilibrado",
          mark: "EQ",
          desc: "Um pouco de cada coisa.",
          enabled: ["pl", "pvp", "dy12", "dy5", "roe", "margem", "divida", "crescLucro"],
          manual: ["governanca", "payout"],
          values: {
            pl: 20,
            pvp: 2,
            dy12: 5,
            dy5: 4,
            roe: 12,
            margem: 8,
            divida: 1.5,
            crescLucro: 6
          }
        }
      ]
    }
  };

  const CLASS_INFO = [
    {
      key: "fii",
      label: "FIIs",
      mark: "FII",
      sub: "Fundos imobiliários",
      tag: "Renda, valor e segurança"
    },
    {
      key: "acao",
      label: "Ações",
      mark: "AÇ",
      sub: "Empresas da B3",
      tag: "Qualidade, dividendos e valor"
    }
  ];

  const GROUP_ORDER = ["Renda", "Valor", "Segurança", "Constância", "Qualidade", "Crescimento"];

  const makeState = (cls, presetKey) => {
    const dataset = DATASETS[cls];
    const preset =
      dataset.presets.find((item) => item.key === presetKey) || dataset.presets[0];
    const values = {};
    const ops = {};

    dataset.criteria.forEach((criterion) => {
      values[criterion.key] =
        Object.prototype.hasOwnProperty.call(preset.values, criterion.key)
          ? preset.values[criterion.key]
          : criterion.defaultValue;
      ops[criterion.key] = criterion.op || "";
    });

    return {
      cls,
      preset: preset.key,
      values,
      ops,
      enabled: new Set(preset.enabled),
      manuals: new Set(preset.manual)
    };
  };

  const states = {
    fii: makeState("fii", DATASETS.fii.defaultPreset),
    acao: makeState("acao", DATASETS.acao.defaultPreset)
  };

  let currentClass = "fii";

  const getState = () => states[currentClass];
  const getDataset = () => DATASETS[currentClass];

  const applyPreset = (state, presetKey) => {
    const dataset = DATASETS[state.cls];
    const preset =
      dataset.presets.find((item) => item.key === presetKey) || dataset.presets[0];

    dataset.criteria.forEach((criterion) => {
      state.values[criterion.key] =
        Object.prototype.hasOwnProperty.call(preset.values, criterion.key)
          ? preset.values[criterion.key]
          : criterion.defaultValue;
      state.ops[criterion.key] = criterion.op || "";
    });

    state.preset = preset.key;
    state.enabled = new Set(preset.enabled);
    state.manuals = new Set(preset.manual);
  };

  const isEffective = (criterion, value) => {
    if (criterion.type === "select") {
      return value !== "" && value !== "todos";
    }
    if (criterion.type === "text") {
      return String(value || "").trim() !== "";
    }
    return value !== "" && value != null && Number.isFinite(Number(value));
  };

  const getActiveCriteria = () => {
    const dataset = getDataset();
    const state = getState();
    return dataset.criteria.filter(
      (criterion) => state.enabled.has(criterion.key) && isEffective(criterion, state.values[criterion.key])
    );
  };

  const getSelectedManuals = () => {
    const dataset = getDataset();
    const state = getState();
    return dataset.manuals.filter((manual) => state.manuals.has(manual.key));
  };

  const getActiveGroups = (activeCriteria) => {
    const active = new Set(activeCriteria.map((criterion) => criterion.group));
    return GROUP_ORDER.filter((group) => active.has(group));
  };

  const getPreset = () => {
    const dataset = getDataset();
    const state = getState();
    return dataset.presets.find((preset) => preset.key === state.preset) || dataset.presets[0];
  };

  const getShortcuts = () => {
    const dataset = getDataset();
    const state = getState();
    const links = [];

    if (currentClass === "fii") {
      links.push({
        label: "Menores P/VP",
        href: "https://investidor10.com.br/fiis/rankings/menor-pvp/"
      });
      links.push({
        label: "Maior DY",
        href: "https://investidor10.com.br/fiis/rankings/maior-dividend-yield/"
      });
      links.push({
        label: "Maior liquidez",
        href: "https://investidor10.com.br/fiis/rankings/maior-liquidez/"
      });

      const tipoCriterion = dataset.criteria.find((criterion) => criterion.key === "tipo");
      const tipo = state.values.tipo;
      if (state.enabled.has("tipo") && isEffective(tipoCriterion, tipo)) {
        links.push({
          label: `Tipo: ${optionLabel(tipoCriterion, tipo)}`,
          href: `https://investidor10.com.br/fiis/tipos/${tipo}/`
        });
      }

      const segmentoCriterion = dataset.criteria.find(
        (criterion) => criterion.key === "segmento"
      );
      const segmento = state.values.segmento;
      if (state.enabled.has("segmento") && isEffective(segmentoCriterion, segmento)) {
        links.push({
          label: `Segmento: ${optionLabel(segmentoCriterion, segmento)}`,
          href: `https://investidor10.com.br/fiis/segmento/${segmento}/`
        });
      }
    } else {
      links.push({
        label: "Mais baratas (Graham)",
        href: "https://investidor10.com.br/acoes/rankings/acoes-mais-baratas-benjamin-graham/"
      });
      links.push({
        label: "Maior DY",
        href: "https://investidor10.com.br/acoes/rankings/maiores-dividend-yield/"
      });
      links.push({
        label: "Buy and Hold",
        href: "https://investidor10.com.br/acoes/rankings/buy-and-hold/"
      });
    }

    return links;
  };

  const els = {
    classGrid: $("#classGrid"),
    styleList: $("#styleList"),
    styleNote: $("#styleNote"),
    resetBtn: $("#resetBtn"),
    criteriaList: $("#criteriaList"),
    manualList: $("#manualList"),
    activeCount: $("#activeCount"),
    manualCount: $("#manualCount"),
    resultContent: $("#resultContent"),
    toast: $("#toast")
  };

  const renderClasses = () => {
    els.classGrid.innerHTML = CLASS_INFO.map((info) => {
      const selected = info.key === currentClass;
      return `
        <button type="button" class="class-card${selected ? " sel" : ""}" data-class="${info.key}" aria-pressed="${selected}">
          <span class="class-icon">${esc(info.mark)}</span>
          <b>${esc(info.label)}</b>
          <small>${esc(info.sub)}</small>
          <em>${esc(info.tag)}</em>
        </button>
      `;
    }).join("");
  };

  const renderStyles = () => {
    const dataset = getDataset();
    const state = getState();

    els.styleList.innerHTML = dataset.styleGroups.map((group) => {
      const cards = group.keys.map((key) => {
        const preset = dataset.presets.find((item) => item.key === key);
        if (!preset) return "";
        const selected = preset.key === state.preset;
        return `
          <button type="button" class="style-card${selected ? " sel" : ""}" data-preset="${preset.key}" aria-pressed="${selected}">
            <span class="style-mark">${esc(preset.mark)}</span>
            <span>
              <b>${esc(preset.name)}</b>
              <small>${esc(preset.desc)}</small>
            </span>
          </button>
        `;
      }).join("");

      return `
        <div class="style-group">
          <div class="style-label">${esc(group.label)}</div>
          <div class="style-grid">${cards}</div>
        </div>
      `;
    }).join("");

    els.styleNote.textContent = dataset.styleNote;
  };

  const renderCriterion = (criterion) => {
    const state = getState();
    const enabled = state.enabled.has(criterion.key);
    const value = state.values[criterion.key];
    let controls = "";

    if (criterion.type === "select") {
      controls = `
        <select class="select-input" data-select="${criterion.key}" aria-label="${esc(criterion.label)}" ${enabled ? "" : "disabled"}>
          ${(criterion.options || []).map((option) => `
            <option value="${esc(option.value)}" ${option.value === value ? "selected" : ""}>${esc(option.label)}</option>
          `).join("")}
        </select>
      `;
    } else if (criterion.type === "text") {
      controls = `
        <input class="select-input text-input" type="text" data-text="${criterion.key}"
          value="${esc(value)}" placeholder="${esc(criterion.placeholder || "")}"
          aria-label="${esc(criterion.label)}" ${enabled ? "" : "disabled"}>
      `;
    } else {
      controls = `
        <select class="op-select" data-op="${criterion.key}" aria-label="Operador de ${esc(criterion.label)}" ${enabled ? "" : "disabled"}>
          <option value="≤" ${state.ops[criterion.key] === "≤" ? "selected" : ""}>≤</option>
          <option value="≥" ${state.ops[criterion.key] === "≥" ? "selected" : ""}>≥</option>
        </select>
        <input class="num-input" type="text" inputmode="decimal" data-number="${criterion.key}"
          value="${esc(inputNumber(value))}" aria-label="${esc(criterion.label)}" ${enabled ? "" : "disabled"}>
        <span class="unit">${esc(criterion.unit)}</span>
      `;
    }

    return `
      <article class="crit${enabled ? "" : " off"}" data-key="${criterion.key}">
        <div class="crit-toggle">
          <label class="switch" title="${enabled ? "Desativar" : "Ativar"} ${esc(criterion.label)}">
            <input type="checkbox" data-toggle="${criterion.key}" ${enabled ? "checked" : ""} aria-label="Ativar ${esc(criterion.label)}">
            <span class="switch-track"></span>
          </label>
        </div>
        <div class="crit-main">
          <div class="crit-title">
            ${esc(criterion.label)}
            <span class="crit-tag">${esc(criterion.group)}</span>
          </div>
          <p class="crit-desc">${esc(criterion.desc)}</p>
        </div>
        <div class="crit-controls">${controls}</div>
      </article>
    `;
  };

  const renderCriteria = () => {
    const dataset = getDataset();
    const groups = [];

    dataset.criteria.forEach((criterion) => {
      let group = groups.find((item) => item.name === criterion.group);
      if (!group) {
        group = { name: criterion.group, criteria: [] };
        groups.push(group);
      }
      group.criteria.push(criterion);
    });

    els.criteriaList.innerHTML = groups.map((group) => `
      <section class="crit-group">
        <div class="crit-group-head">
          <h3>${esc(group.name)}</h3>
          <span>${plural(group.criteria.length, "critério", "critérios")}</span>
        </div>
        <div class="crit-list">
          ${group.criteria.map(renderCriterion).join("")}
        </div>
      </section>
    `).join("");
  };

  const renderManuals = () => {
    const dataset = getDataset();
    const state = getState();

    els.manualList.className = "manual-list";
    els.manualList.innerHTML = dataset.manuals.map((manual) => {
      const checked = state.manuals.has(manual.key);
      return `
        <label class="manual${checked ? " on" : ""}">
          <input type="checkbox" data-manual="${manual.key}" ${checked ? "checked" : ""}>
          <span>
            <b>${esc(manual.label)}</b>
            <small>${esc(manual.desc)}</small>
          </span>
        </label>
      `;
    }).join("");
  };

  const updateCounts = () => {
    const active = getActiveCriteria();
    const manuals = getSelectedManuals();
    els.activeCount.textContent = `${active.length} ${active.length === 1 ? "ativo" : "ativos"}`;
    els.manualCount.textContent = `${manuals.length} ${manuals.length === 1 ? "selecionada" : "selecionadas"}`;
  };

  const renderResult = () => {
    updateCounts();

    const dataset = getDataset();
    const state = getState();
    const active = getActiveCriteria();
    const manuals = getSelectedManuals();
    const groups = getActiveGroups(active);
    const preset = getPreset();
    const empty = active.length === 0 && manuals.length === 0;
    const groupText = groups.length
      ? groups.join(" + ")
      : active.length
        ? "Personalizado"
        : manuals.length
          ? "Checklist manual"
          : "Sem critérios";
    const shortcuts = getShortcuts();

    const filterRows = active.map((criterion) => `
      <div class="filter-row">
        <span class="l">${esc(criterion.label)}</span>
        <span class="v">${esc(formatCriterion(criterion, state.values[criterion.key], state.ops[criterion.key]))}</span>
      </div>
    `).join("");

    const manualRows = manuals.map((manual) => `
      <div class="manual-result">
        <span><b>${esc(manual.label)}</b><br>${esc(manual.desc)}</span>
      </div>
    `).join("");

    const shortcutLinks = shortcuts.map((link) => `
      <a class="shortcut" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">
        <span>↗</span>${esc(link.label)}
      </a>
    `).join("");

    els.resultContent.innerHTML = `
      <p class="result-kicker">${empty ? "Ajuste o filtro" : "Roteiro gerado"}</p>
      <h2 class="result-title">Filtro de ${esc(dataset.label)}<br><span>${esc(groupText)}</span></h2>
      <p class="result-sub">
        ${empty
          ? "Ative pelo menos um critério para gerar o roteiro. Você pode combinar quantos filtros quiser."
          : `${plural(active.length, "filtro ativo", "filtros ativos")} · ${plural(manuals.length, "verificação manual", "verificações manuais")} · Estilo ${esc(preset.name)}`}
      </p>

      <div class="result-badges">
        <span class="badge accent">${esc(dataset.label)}</span>
        <span class="badge">${esc(preset.name)}</span>
        ${active.length ? `<span class="badge">${plural(active.length, "filtro", "filtros")}</span>` : ""}
        ${manuals.length ? `<span class="badge">${plural(manuals.length, "verificação", "verificações")}</span>` : ""}
      </div>

      <div class="result-section">
        <div class="result-section-head">
          <h3>Filtros para configurar</h3>
          <span>no Investidor10</span>
        </div>
        ${filterRows
          ? `<div class="filter-list">${filterRows}</div>
             <p class="small-note">Se algum indicador não aparecer como filtro na plataforma, use a coluna de mesmo nome para comparar.</p>`
          : `<p class="small-note">Nenhum filtro numérico ativo. Ative um critério acima ou use o checklist manual.</p>`}
      </div>

      ${manualRows
        ? `
          <div class="result-section">
            <div class="result-section-head">
              <h3>Verificações manuais</h3>
              <span>${plural(manuals.length, "item", "itens")}</span>
            </div>
            <div class="manual-result-list">${manualRows}</div>
          </div>
        `
        : ""}

      <div class="result-section">
        <div class="result-section-head">
          <h3>Atalhos</h3>
          <span>abrem em nova aba</span>
        </div>
        <div class="shortcuts">${shortcutLinks}</div>
      </div>

      <div class="result-actions">
        <button type="button" class="btn btn-primary" data-copy ${empty ? "disabled" : ""}>
          ${empty ? "Nada para copiar" : "Copiar roteiro"}
        </button>
        <a class="btn btn-secondary" href="${esc(dataset.baseUrl)}" target="_blank" rel="noopener noreferrer">
          Abrir ${esc(dataset.label)}
        </a>
      </div>
      <p class="copy-status" data-copy-status></p>

      <p class="disclaimer">
        Roteiro educacional. Não é recomendação de compra ou venda. O Investidor10 pode mudar nomes e campos;
        confira a interface. Este site não tem vínculo oficial com a plataforma.
      </p>
    `;
  };

  const renderAll = () => {
    renderClasses();
    renderStyles();
    renderCriteria();
    renderManuals();
    renderResult();
  };

  const buildCopyText = () => {
    const dataset = getDataset();
    const state = getState();
    const active = getActiveCriteria();
    const manuals = getSelectedManuals();
    const groups = getActiveGroups(active);
    const preset = getPreset();
    const lines = [];

    const copyLabel = currentClass === "fii" ? "FIIs" : "AÇÕES";
    lines.push(
      `FILTRO DE ${copyLabel} — ${(groups.length ? groups.join(" + ") : "PERSONALIZADO").toUpperCase()}`
    );
    lines.push(`Estilo: ${preset.name}`);
    lines.push(`Classe: ${dataset.label}`);
    lines.push("");
    lines.push(`BASE NO INVESTIDOR10: ${dataset.baseUrl}`);
    lines.push("");
    lines.push("FILTROS PARA CONFIGURAR:");
    if (active.length) {
      active.forEach((criterion) => {
        lines.push(`- ${formatCriterionForCopy(criterion, state.values[criterion.key], state.ops[criterion.key])}`);
      });
    } else {
      lines.push("- Nenhum filtro numérico ativo.");
    }

    lines.push("");
    lines.push("Obs.: se algum indicador aparecer só como coluna, use a coluna de mesmo nome para comparar.");

    if (manuals.length) {
      lines.push("");
      lines.push("VERIFICAÇÕES MANUAIS:");
      manuals.forEach((manual) => {
        lines.push(`- ${manual.label}`);
      });
    }

    lines.push("");
    lines.push("ATALHOS:");
    getShortcuts().forEach((link) => {
      lines.push(`- ${link.label}: ${link.href}`);
    });

    lines.push("");
    lines.push("Como usar: abra a lista, aplique os filtros e confira o checklist em cada ativo.");
    lines.push("Roteiro educacional. Não é recomendação de investimento. Confira os dados e o relatório de cada ativo.");

    return lines.join("\n");
  };

  let toastTimer = 0;

  const showToast = (message) => {
    els.toast.textContent = message;
    els.toast.classList.add("on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("on");
    }, 2600);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // O fallback abaixo tenta funcionar em navegadores sem Clipboard API.
    }

    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      area.style.top = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch (error) {
      return false;
    }
  };

  const handleCopy = async (button) => {
    if (!button || button.disabled) return;
    const ok = await copyText(buildCopyText());
    const status = $("[data-copy-status]");

    if (ok) {
      if (status) status.textContent = "Roteiro copiado. Cole no seu bloco de notas ou onde preferir.";
      button.textContent = "Copiado!";
      showToast("Roteiro copiado.");
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = "Copiar roteiro";
      }, 1800);
    } else {
      if (status) status.textContent = "Não foi possível copiar automaticamente. Selecione o texto do roteiro na tela.";
      showToast("Não foi possível copiar automaticamente.");
    }
  };

  els.classGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-class]");
    if (!button) return;
    const next = button.dataset.class;
    if (!DATASETS[next] || next === currentClass) return;
    currentClass = next;
    renderAll();
  });

  els.styleList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (!button) return;
    const state = getState();
    applyPreset(state, button.dataset.preset);
    renderAll();
  });

  els.resetBtn.addEventListener("click", () => {
    const state = getState();
    applyPreset(state, state.preset);
    renderAll();
    showToast("Estilo restaurado.");
  });

  els.criteriaList.addEventListener("change", (event) => {
    const target = event.target;
    const state = getState();

    if (target.matches("[data-toggle]")) {
      const key = target.dataset.toggle;
      if (target.checked) state.enabled.add(key);
      else state.enabled.delete(key);
      renderCriteria();
      renderResult();
      return;
    }

    if (target.matches("[data-op]")) {
      state.ops[target.dataset.op] = target.value;
      renderResult();
      return;
    }

    if (target.matches("[data-select]")) {
      state.values[target.dataset.select] = target.value;
      renderResult();
    }
  });

  els.criteriaList.addEventListener("input", (event) => {
    const target = event.target;
    const state = getState();

    if (target.matches("[data-number]")) {
      state.values[target.dataset.number] = parseInput(target.value);
      renderResult();
      return;
    }

    if (target.matches("[data-text]")) {
      state.values[target.dataset.text] = target.value;
      renderResult();
    }
  });

  els.manualList.addEventListener("change", (event) => {
    const target = event.target.closest("[data-manual]");
    if (!target) return;
    const state = getState();
    const key = target.dataset.manual;

    if (target.checked) state.manuals.add(key);
    else state.manuals.delete(key);

    const label = target.closest(".manual");
    if (label) label.classList.toggle("on", target.checked);
    renderResult();
  });

  els.resultContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (button) handleCopy(button);
  });

  renderAll();
})();

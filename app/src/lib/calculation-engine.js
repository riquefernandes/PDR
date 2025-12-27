// calculation-engine.js

import {
  add,
  differenceInYears,
  getDate,
  isAfter,
  startOfYear,
  getYear,
  getMonth,
  isBefore,
  isEqual,
  lastDayOfMonth,
  differenceInDays,
  startOfMonth,
} from "date-fns";
import {
  MOTIVOS_DEMISSAO,
  TIPOS_AVISO_PREVIO,
  DIAS_AVISO_BASE,
  DIAS_ADICIONAIS_POR_ANO,
  DIAS_PARA_MES_COMPLETO,
  MESES_NO_ANO,
  TABELA_INSS,
  TABELA_IR,
  DEDUCAO_POR_DEPENDENTE_IR,
} from "./config.js";

// --- FUNÇÕES DE VALIDAÇÃO ---

function validarDados(dados) {
  if (!dados) {
    throw new Error("Objeto de dados da rescisão não pode ser nulo.");
  }
  const { dataInicio, dataFim, salarioBrutoEmCentavos } = dados;

  if (!(dataInicio instanceof Date) || !(dataFim instanceof Date)) {
    throw new Error("Datas de início e fim devem ser objetos Date válidos.");
  }

  if (isAfter(dataInicio, dataFim)) {
    throw new Error("A data de início não pode ser posterior à data de fim.");
  }

  if (
    typeof salarioBrutoEmCentavos !== "number" ||
    salarioBrutoEmCentavos < 0
  ) {
    throw new Error("Salário bruto deve ser um número não-negativo.");
  }
}

// --- FUNÇÕES DE CÁLCULO DE VERBAS ---

function calcularSaldoSalario(dataFim, salarioBrutoEmCentavos) {
  const diasTrabalhadosNoMes = getDate(dataFim);
  const salarioPorDia = Math.floor(salarioBrutoEmCentavos / 30);
  return salarioPorDia * diasTrabalhadosNoMes;
}

function calcularMesesTrabalhados(dataInicio, dataFim) {
  if (isAfter(dataInicio, dataFim)) {
    return 0;
  }

  const dataFimAno = getYear(dataFim);
  const dataFimMes = getMonth(dataFim);

  let meses = 0;
  let dataCorrente = new Date(dataInicio);

  while (
    getYear(dataCorrente) < dataFimAno ||
    (getYear(dataCorrente) === dataFimAno &&
      getMonth(dataCorrente) <= dataFimMes)
  ) {
    const ano = getYear(dataCorrente);
    const mes = getMonth(dataCorrente);

    const primeiroDiaDoMes = startOfMonth(dataCorrente);
    const ultimoDiaDoMes = lastDayOfMonth(dataCorrente);

    const inicioEfetivo = isAfter(dataInicio, primeiroDiaDoMes)
      ? dataInicio
      : primeiroDiaDoMes;
    const fimEfetivo = isBefore(dataFim, ultimoDiaDoMes)
      ? dataFim
      : ultimoDiaDoMes;

    const diasNoMes = differenceInDays(fimEfetivo, inicioEfetivo) + 1;

    if (diasNoMes >= DIAS_PARA_MES_COMPLETO) {
      meses++;
    }

    dataCorrente = add(primeiroDiaDoMes, { months: 1 });
  }

  return meses;
}

function calcularDiasAvisoPrevio(dataInicio, dataFim) {
  const anosCompletos = differenceInYears(dataFim, dataInicio);
  const diasCalculados =
    DIAS_AVISO_BASE + anosCompletos * DIAS_ADICIONAIS_POR_ANO;
  return Math.min(diasCalculados, 90);
}

function calcularFerias(
  dataInicio,
  dataFim,
  salarioBrutoEmCentavos,
  feriasVencidasNaoGozadas,
  motivoDemissao
) {
  if (motivoDemissao === MOTIVOS_DEMISSAO.JUSTA_CAUSA) return 0;

  let totalFerias = 0;

  if (feriasVencidasNaoGozadas > 0) {
    const valorFeriasVencidas =
      salarioBrutoEmCentavos * feriasVencidasNaoGozadas;
    totalFerias += valorFeriasVencidas + Math.floor(valorFeriasVencidas / 3);
  }

  const anosCompletos = differenceInYears(dataFim, dataInicio);
  const dataInicioPeriodoAquisitivo = add(dataInicio, { years: anosCompletos });

  const mesesProporcionais = calcularMesesTrabalhados(
    dataInicioPeriodoAquisitivo,
    dataFim
  );

  if (mesesProporcionais > 0) {
    const baseProporcional = Math.floor(
      (salarioBrutoEmCentavos / MESES_NO_ANO) * mesesProporcionais
    );
    totalFerias += baseProporcional + Math.floor(baseProporcional / 3);
  }

  return totalFerias;
}

function calcularDecimoTerceiro(
  dataInicio,
  dataFim,
  salarioBrutoEmCentavos,
  motivoDemissao
) {
  if (motivoDemissao === MOTIVOS_DEMISSAO.JUSTA_CAUSA) return 0;

  const inicioAnoRescisao = startOfYear(dataFim);
  const dataInicioContagem = isAfter(dataInicio, inicioAnoRescisao)
    ? dataInicio
    : inicioAnoRescisao;

  const mesesTrabalhadosNoAno = calcularMesesTrabalhados(
    dataInicioContagem,
    dataFim
  );

  return Math.floor(
    (salarioBrutoEmCentavos / MESES_NO_ANO) * mesesTrabalhadosNoAno
  );
}

function calcularValoresFGTS(
  dataInicio,

  dataFim,

  salarioBrutoEmCentavos,

  motivoDemissao
) {
  if (motivoDemissao !== MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA) {
    return { saldo: 0, multa: 0 };
  }

  const mesesTotais = calcularMesesTrabalhados(dataInicio, dataFim);

  const depositoMensal = salarioBrutoEmCentavos * 0.08;

  const saldoEstimadoFGTS = Math.floor(depositoMensal * mesesTotais);

  const multa = Math.floor(saldoEstimadoFGTS * 0.4);

  return { saldo: saldoEstimadoFGTS, multa };
}

function calcularINSS(baseCalculoEmCentavos) {
  let inssTotal = 0;

  let salarioRestante = baseCalculoEmCentavos;

  let tetoFaixa = 0;

  for (let i = 0; i < TABELA_INSS.length; i++) {
    const faixa = TABELA_INSS[i];

    const limiteAnterior = i > 0 ? TABELA_INSS[i - 1].ate : 0;

    tetoFaixa = faixa.ate - limiteAnterior;

    if (salarioRestante <= 0) break;

    const valorNaFaixa = Math.min(salarioRestante, tetoFaixa);

    inssTotal += Math.floor(valorNaFaixa * faixa.aliquota);

    salarioRestante -= valorNaFaixa;
  }

  return inssTotal;
}

function calcularIRRF(
  baseCalculoEmCentavos,

  inssEmCentavos,

  dependentesIR,

  usarDeducaoDependente = true
) {
  const deducaoDependentes = usarDeducaoDependente
    ? dependentesIR * DEDUCAO_POR_DEPENDENTE_IR
    : 0;

  const baseIR = baseCalculoEmCentavos - inssEmCentavos - deducaoDependentes;

  if (baseIR <= 0) return 0;

  const faixaIR =
    TABELA_IR.find((faixa) => baseIR <= faixa.ate) ??
    TABELA_IR[TABELA_IR.length - 1];

  const irCalculado = Math.floor(baseIR * faixaIR.aliquota - faixaIR.deducao);

  return Math.max(0, irCalculado);
}

function calcularPensaoAlimenticia(baseCalculoEmCentavos, percentual) {
  if (percentual <= 0) return 0;

  return Math.floor(baseCalculoEmCentavos * (percentual / 100));
}

function calcularDescontos(verbas, dadosRescisao) {
  const { dependentesIR, pensaoAlimenticiaPercentual } = dadosRescisao;

  const inssSobreSaldo = calcularINSS(verbas.saldoSalario);

  const inssSobreDecimo = calcularINSS(verbas.decimoTerceiro);

  const inssTotal = inssSobreSaldo + inssSobreDecimo;

  const irrfSobreSaldo = calcularIRRF(
    verbas.saldoSalario,

    inssSobreSaldo,

    dependentesIR,

    true
  );

  const irrfSobreDecimo = calcularIRRF(
    verbas.decimoTerceiro,

    inssSobreDecimo,

    0,

    false
  );

  const irrfTotal = irrfSobreSaldo + irrfSobreDecimo;

  const basePensao =
    verbas.saldoSalario +
    verbas.decimoTerceiro +
    verbas.avisoPrevio +
    verbas.ferias -
    inssTotal -
    irrfTotal;

  const pensaoTotal = calcularPensaoAlimenticia(
    Math.max(0, basePensao),

    pensaoAlimenticiaPercentual
  );

  const totalDescontos = inssTotal + irrfTotal + pensaoTotal;

  return {
    inss: inssTotal,

    irrf: irrfTotal,

    pensao: pensaoTotal,

    totalDescontos,
  };
}

function formatarParaBRL(valorEmCentavos) {
  const valor = valorEmCentavos / 100;

  return valor.toLocaleString("pt-BR", {
    style: "currency",

    currency: "BRL",
  });
}

export function calcularRescisaoCompleta(dados) {
  validarDados(dados);

  const {
    dataInicio,

    dataFim,

    salarioBrutoEmCentavos,

    feriasVencidasNaoGozadas,

    motivoDemissao,

    tipoAvisoPrevio,
  } = dados;

  let dataFimEfetiva = dataFim;

  let diasAvisoPrevio = 0;

  let valorAvisoPrevio = 0;

  // Lógica do Aviso Prévio

  if (motivoDemissao === MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA) {
    diasAvisoPrevio = calcularDiasAvisoPrevio(dataInicio, dataFim);

    if (tipoAvisoPrevio === TIPOS_AVISO_PREVIO.INDENIZADO) {
      dataFimEfetiva = add(dataFim, { days: diasAvisoPrevio });

      const salarioPorDia = Math.floor(salarioBrutoEmCentavos / 30);

      valorAvisoPrevio = salarioPorDia * diasAvisoPrevio;
    }
  }

  const fgts = calcularValoresFGTS(
    dataInicio,

    dataFimEfetiva, // Usa data projetada

    salarioBrutoEmCentavos,

    motivoDemissao
  );

  const verbas = {
    saldoSalario: calcularSaldoSalario(dataFim, salarioBrutoEmCentavos), // Saldo é sobre o último mês trabalhado

    avisoPrevio: valorAvisoPrevio,

    ferias: calcularFerias(
      dataInicio,

      dataFimEfetiva, // Usa data projetada

      salarioBrutoEmCentavos,

      feriasVencidasNaoGozadas,

      motivoDemissao
    ),

    decimoTerceiro: calcularDecimoTerceiro(
      dataInicio,

      dataFimEfetiva, // Usa data projetada

      salarioBrutoEmCentavos,

      motivoDemissao
    ),

    multaFGTS: fgts.multa,
  };

  const totalBruto = Object.values(verbas).reduce((acc, val) => acc + val, 0);

  const descontos = calcularDescontos(verbas, dados);

  const totalLiquido = totalBruto - descontos.totalDescontos;

  return {
    informacoes: {
      "Data de Início": dataInicio.toLocaleDateString("pt-BR"),

      "Data de Fim (Original)": dataFim.toLocaleDateString("pt-BR"),

      "Data Final (Projetada)": dataFimEfetiva.toLocaleDateString("pt-BR"),

      "Meses Trabalhados (com projeção)": calcularMesesTrabalhados(
        dataInicio,

        dataFimEfetiva
      ),

      "Dias de Aviso Prévio": diasAvisoPrevio,

      Motivo: motivoDemissao.replace(/_/g, " "),

      "Tipo de Aviso": tipoAvisoPrevio.replace(/_/g, " "),
    },

    verbas: {
      "Saldo de Salário": formatarParaBRL(verbas.saldoSalario),

      "Aviso Prévio Indenizado": formatarParaBRL(verbas.avisoPrevio),

      "Férias (Vencidas + Proporcionais)": formatarParaBRL(verbas.ferias),

      "13º Salário Proporcional": formatarParaBRL(verbas.decimoTerceiro),

      "Multa 40% FGTS": formatarParaBRL(verbas.multaFGTS),

      "": "───────────────",

      "TOTAL BRUTO": formatarParaBRL(totalBruto),
    },

    descontos: {
      INSS: formatarParaBRL(descontos.inss),

      IRRF: formatarParaBRL(descontos.irrf),

      "Pensão Alimentícia": formatarParaBRL(descontos.pensao),

      "": "───────────────",

      "TOTAL DESCONTOS": formatarParaBRL(descontos.totalDescontos),
    },

    resumo: {
      "Total Bruto": formatarParaBRL(totalBruto),

      "Total Descontos": formatarParaBRL(descontos.totalDescontos),

      "TOTAL LÍQUIDO A RECEBER": formatarParaBRL(totalLiquido),
    },

    fgts: {
      "Saldo FGTS Estimado para Saque": formatarParaBRL(fgts.saldo),

      Observação:
        "Valor a ser sacado da conta FGTS, não incluso no total líquido da rescisão.",
    },
  };
}

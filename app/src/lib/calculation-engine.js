import {
  add,
  differenceInYears,
  getDate,
  isAfter,
  startOfYear,
} from "date-fns";
import {
  dadosRescisaoPadrao,
  MOTIVOS_DEMISSAO,
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

function calcularMesesTrabalhados(
  dataInicio,
  dataFim,
  considerarDiaProjecao = false
) {
  const dataProjecao = considerarDiaProjecao
    ? add(dataFim, { days: 1 })
    : dataFim;

  const mesesCompletos =
    (dataProjecao.getFullYear() - dataInicio.getFullYear()) * 12 +
    (dataProjecao.getMonth() - dataInicio.getMonth());

  const meses =
    dataProjecao.getDate() >= DIAS_PARA_MES_COMPLETO
      ? mesesCompletos + 1
      : mesesCompletos;

  return Math.max(0, meses);
}

function calcularDiasAvisoPrevio(dataInicio, dataFim) {
  const anosCompletos = differenceInYears(dataFim, dataInicio);
  const diasCalculados =
    DIAS_AVISO_BASE + anosCompletos * DIAS_ADICIONAIS_POR_ANO;
  return Math.min(diasCalculados, 90);
}

function calcularAvisoPrevioIndenizado(
  dataInicio,
  dataFim,
  salarioBrutoEmCentavos,
  avisoPrevioCumprido,
  motivoDemissao
) {
  const mesesTrabalhados = calcularMesesTrabalhados(dataInicio, dataFim);
  if (
    motivoDemissao !== MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA ||
    avisoPrevioCumprido ||
    mesesTrabalhados < 3
  ) {
    return 0;
  }

  const diasAviso = calcularDiasAvisoPrevio(dataInicio, dataFim);
  const salarioPorDia = Math.floor(salarioBrutoEmCentavos / 30);
  return salarioPorDia * diasAviso;
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
  const umTerco = 1 / 3;

  // Férias Vencidas
  if (feriasVencidasNaoGozadas > 0) {
    const valorFeriasVencidas =
      salarioBrutoEmCentavos * feriasVencidasNaoGozadas;
    totalFerias +=
      valorFeriasVencidas + Math.floor(valorFeriasVencidas * umTerco);
  }

  // Férias Proporcionais
  const dataInicioPeriodoAquisitivo = add(dataInicio, {
    years: differenceInYears(dataFim, dataInicio),
  });

  const mesesProporcionais = calcularMesesTrabalhados(
    dataInicioPeriodoAquisitivo,
    dataFim,
    true
  );

  if (mesesProporcionais > 0) {
    const baseProporcional = Math.floor(
      (salarioBrutoEmCentavos / MESES_NO_ANO) * mesesProporcionais
    );
    totalFerias += baseProporcional + Math.floor(baseProporcional * umTerco);
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
    dataFim,
    true
  );

  return Math.floor(
    (salarioBrutoEmCentavos / MESES_NO_ANO) * mesesTrabalhadosNoAno
  );
}

function calcularMultaFGTS(
  dataInicio,
  dataFim,
  salarioBrutoEmCentavos,
  motivoDemissao
) {
  if (motivoDemissao !== MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA) return 0;

  const mesesTotais = calcularMesesTrabalhados(dataInicio, dataFim, true);
  const depositoMensal = salarioBrutoEmCentavos * 0.08;
  const saldoEstimadoFGTS = depositoMensal * mesesTotais;
  const multa = saldoEstimadoFGTS * 0.4;

  return Math.floor(multa);
}

// --- FUNÇÕES DE CÁLCULO DE DESCONTOS ---

function calcularINSS(baseCalculoEmCentavos) {
  let inssTotal = 0;
  let salarioRestante = baseCalculoEmCentavos;
  let tetoFaixa = 0;

  for (let i = 0; i < TABELA_INSS.length; i++) {
    const faixa = TABELA_INSS[i];
    const limiteAnterior = i > 0 ? TABELA_INSS[i - 1].ate : 0;

    // Se a base de cálculo for maior que o teto da faixa, usa o teto da faixa
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
  // Base de cálculo = salário bruto - INSS - dedução por dependente (se aplicável)
  const deducaoDependentes = usarDeducaoDependente
    ? dependentesIR * DEDUCAO_POR_DEPENDENTE_IR
    : 0;
  const baseIR = baseCalculoEmCentavos - inssEmCentavos - deducaoDependentes;

  if (baseIR <= 0) return 0;

  // Encontra a faixa correspondente
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

  // 1. Cálculo de INSS (separado por base)
  // Férias e Aviso Prévio Indenizado são isentos de INSS.
  const inssSobreSaldo = calcularINSS(verbas.saldoSalario);
  const inssSobreDecimo = calcularINSS(verbas.decimoTerceiro);
  const inssTotal = inssSobreSaldo + inssSobreDecimo;

  // 2. Cálculo de IRRF (separado por base)
  // Férias e Aviso Prévio Indenizado são isentos de IRRF.
  // 13º tem tributação exclusiva.
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
  ); // Dedução de dependentes não se aplica ao 13º
  const irrfTotal = irrfSobreSaldo + irrfSobreDecimo;

  // 3. Cálculo de Pensão Alimentícia
  // A base de cálculo da pensão pode variar MUITO.
  // Uma abordagem comum é sobre o rendimento líquido (Bruto - Descontos).
  // FGTS e sua multa não entram na base. Férias indenizadas também podem ficar de fora.
  // **Esta é uma simplificação e deve ser validada com a decisão judicial.**
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

// --- ORQUESTRADOR ---

function formatarParaBRL(valorEmCentavos) {
  const valor = valorEmCentavos / 100;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function calcularRescisaoCompleta(dados) {
  // 1. Valida os dados de entrada antes de começar
  validarDados(dados);

  const {
    dataInicio,
    dataFim,
    salarioBrutoEmCentavos,
    avisoPrevioCumprido,
    feriasVencidasNaoGozadas,
    motivoDemissao,
  } = dados;

  // 2. Cálculo das verbas
  const verbas = {
    saldoSalario: calcularSaldoSalario(dataFim, salarioBrutoEmCentavos),
    avisoPrevio: calcularAvisoPrevioIndenizado(
      dataInicio,
      dataFim,
      salarioBrutoEmCentavos,
      avisoPrevioCumprido,
      motivoDemissao
    ),
    ferias: calcularFerias(
      dataInicio,
      dataFim,
      salarioBrutoEmCentavos,
      feriasVencidasNaoGozadas,
      motivoDemissao
    ),
    decimoTerceiro: calcularDecimoTerceiro(
      dataInicio,
      dataFim,
      salarioBrutoEmCentavos,
      motivoDemissao
    ),
    multaFGTS: calcularMultaFGTS(
      dataInicio,
      dataFim,
      salarioBrutoEmCentavos,
      motivoDemissao
    ),
  };

  const totalBruto = Object.values(verbas).reduce((acc, val) => acc + val, 0);

  // 3. Cálculo dos descontos
  const descontos = calcularDescontos(verbas, dados);
  const totalLiquido = totalBruto - descontos.totalDescontos;

  // 4. Montagem do resultado
  return {
    informacoes: {
      "Data de Início": dataInicio.toLocaleDateString("pt-BR"),
      "Data de Fim": dataFim.toLocaleDateString("pt-BR"),
      "Meses Trabalhados": calcularMesesTrabalhados(dataInicio, dataFim, true),
      "Dias de Aviso Prévio": calcularDiasAvisoPrevio(dataInicio, dataFim),
      Motivo: motivoDemissao.replace(/_/g, " "),
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
  };
}

// --- EXECUÇÃO ---
// Esta parte será removida na aplicação Next.js e substituída pela interação com a UI
try {
  const resultado = calcularRescisaoCompleta(dadosRescisaoPadrao);

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║     CÁLCULO DE RESCISÃO TRABALHISTA (CLT)            ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  console.log("📋 INFORMAÇÕES DO CONTRATO:");
  console.table(resultado.informacoes);

  console.log("\n💰 VERBAS RESCISÓRIAS:");
  console.table(resultado.verbas);

  console.log("\n📉 DESCONTOS:");
  console.table(resultado.descontos);

  console.log("\n💵 RESUMO FINAL:");
  console.table(resultado.resumo);
} catch (error) {
  console.error("❌ Erro ao calcular a rescisão:", error.message);
}

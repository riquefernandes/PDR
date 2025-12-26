// Configuração do cálculo
const dadosRescisao = {
  dataInicio: new Date("2025-06-12"),
  dataFim: new Date("2025-12-25"),
  salario: 1518,
  avisoPrevioCumprido: false, // false = indenizado
  temFeriasVencidas: false, // Ajustar conforme período aquisitivo
  motivoDemissao: "sem_justa_causa", // sem_justa_causa | pedido_demissao | justa_causa
};

const DIAS_POR_ANO = 365.25; // Considera anos bissextos
const DIAS_AVISO_BASE = 30;
const DIAS_ADICIONAIS_POR_ANO = 3;
const DIAS_PARA_MES_COMPLETO = 15;

// Calcula dias trabalhados no mês de saída
function calcularSaldoSalario(dataInicio, dataFim, salario) {
  const ano = dataFim.getFullYear();
  const mes = dataFim.getMonth();

  // Primeiro dia do mês ou data de início (o que for maior)
  const inicioMes = new Date(ano, mes, 1);
  const dataInicioEfetiva = dataInicio > inicioMes ? dataInicio : inicioMes;

  // Calcula dias trabalhados no mês
  const diasTrabalhados =
    Math.floor((dataFim - dataInicioEfetiva) / (24 * 60 * 60 * 1000)) + 1;

  return Number(((salario / 30) * diasTrabalhados).toFixed(2));
}

// Calcula tempo de serviço em dias
function calcularDiasTrabalhados(dataInicio, dataFim) {
  return Math.floor((dataFim - dataInicio) / (24 * 60 * 60 * 1000));
}

// Calcula meses trabalhados (regra dos 15 dias)
function calcularMesesTrabalhados(dataInicio, dataFim) {
  let meses = 0;
  let data = new Date(dataInicio);
  const UM_DIA = 1000 * 60 * 60 * 24;

  while (data <= dataFim) {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0);

    const inicioEfetivo = Math.max(data.getTime(), inicioMes.getTime());
    const fimEfetivo = Math.min(dataFim.getTime(), fimMes.getTime());

    const diasNoMes = Math.floor((fimEfetivo - inicioEfetivo) / UM_DIA) + 1;

    if (diasNoMes >= DIAS_PARA_MES_COMPLETO) meses++;

    data.setDate(1);
    data.setMonth(mes + 1);
  }

  return meses;
}

// Calcula dias de aviso prévio proporcional
function calcularDiasAvisoPrevio(dataInicio, dataFim) {
  const diasTrabalhados = calcularDiasTrabalhados(dataInicio, dataFim);
  const anosCompletos = Math.floor(diasTrabalhados / DIAS_POR_ANO);
  const diasCalculados =
    DIAS_AVISO_BASE + anosCompletos * DIAS_ADICIONAIS_POR_ANO;

  return Math.min(diasCalculados, 90);
}

// Aviso prévio indenizado
function calcularAvisoPrevio(
  dataInicio,
  dataFim,
  salario,
  avisoPrevioCumprido,
  motivoDemissao
) {
  // Só tem direito se demissão sem justa causa e mais de 3 meses trabalhados
  const meses = calcularMesesTrabalhados(dataInicio, dataFim);

  if (
    motivoDemissao !== "sem_justa_causa" ||
    meses < 3 ||
    avisoPrevioCumprido
  ) {
    return 0;
  }

  const diasAviso = calcularDiasAvisoPrevio(dataInicio, dataFim);
  return Number(((salario / 30) * diasAviso).toFixed(2));
}

// Férias (vencidas + proporcionais + 1/3 constitucional)
function calcularFerias(
  dataInicio,
  dataFim,
  salario,
  temFeriasVencidas,
  motivoDemissao
) {
  const meses = calcularMesesTrabalhados(dataInicio, dataFim);
  let total = 0;

  // Férias vencidas (período aquisitivo completo de 12 meses)
  if (temFeriasVencidas && motivoDemissao === "sem_justa_causa") {
    total += salario + salario / 3; // Salário + 1/3 constitucional
  }

  // Férias proporcionais (só tem direito se demissão sem justa causa)
  if (motivoDemissao === "sem_justa_causa" && meses >= 1) {
    const mesesProporcionais = temFeriasVencidas ? meses - 12 : meses;

    if (mesesProporcionais > 0) {
      const baseProporcionais = (salario / 12) * mesesProporcionais;
      total += baseProporcionais + baseProporcionais / 3;
    }
  }

  return Number(total.toFixed(2));
}

// 13º salário proporcional
function calcularDecimoTerceiro(dataInicio, dataFim, salario, motivoDemissao) {
  // Justa causa não tem direito
  if (motivoDemissao === "justa_causa") return 0;

  const anoRescisao = dataFim.getFullYear();
  const inicioCalculo =
    dataInicio > new Date(anoRescisao, 0, 1)
      ? dataInicio
      : new Date(anoRescisao, 0, 1);

  let meses = 0;
  let data = new Date(inicioCalculo);
  const UM_DIA = 1000 * 60 * 60 * 24;

  while (data <= dataFim) {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0);

    const inicioEfetivo = Math.max(
      inicioMes.getTime(),
      inicioCalculo.getTime()
    );
    const fimEfetivo = Math.min(fimMes.getTime(), dataFim.getTime());

    const dias = Math.floor((fimEfetivo - inicioEfetivo) / UM_DIA) + 1;

    if (dias >= DIAS_PARA_MES_COMPLETO) meses++;

    data.setMonth(mes + 1);
  }

  return Number(((salario / 12) * meses).toFixed(2));
}

// Multa FGTS (40% sobre saldo, apenas demissão sem justa causa)
function calcularMultaFGTS(dataInicio, dataFim, salario, motivoDemissao) {
  if (motivoDemissao !== "sem_justa_causa") return 0;

  const meses = calcularMesesTrabalhados(dataInicio, dataFim);
  const saldoFGTS = salario * 0.08 * meses; // 8% do salário por mês

  return Number((saldoFGTS * 0.4).toFixed(2));
}

// Cálculo completo
function calcularRescisaoCompleta(dados) {
  const {
    dataInicio,
    dataFim,
    salario,
    avisoPrevioCumprido,
    temFeriasVencidas,
    motivoDemissao,
  } = dados;

  const saldoSalario = calcularSaldoSalario(dataInicio, dataFim, salario);
  const avisoPrevio = calcularAvisoPrevio(
    dataInicio,
    dataFim,
    salario,
    avisoPrevioCumprido,
    motivoDemissao
  );
  const ferias = calcularFerias(
    dataInicio,
    dataFim,
    salario,
    temFeriasVencidas,
    motivoDemissao
  );
  const decimoTerceiro = calcularDecimoTerceiro(
    dataInicio,
    dataFim,
    salario,
    motivoDemissao
  );
  const multaFGTS = calcularMultaFGTS(
    dataInicio,
    dataFim,
    salario,
    motivoDemissao
  );

  const mesesTrabalhados = calcularMesesTrabalhados(dataInicio, dataFim);
  const diasAvisoPrevio = calcularDiasAvisoPrevio(dataInicio, dataFim);

  return {
    informacoes: {
      dataInicio: dataInicio.toLocaleDateString("pt-BR"),
      dataFim: dataFim.toLocaleDateString("pt-BR"),
      mesesTrabalhados,
      diasAvisoPrevio,
      motivoDemissao,
    },
    verbas: {
      saldoSalario,
      avisoPrevio,
      ferias,
      decimoTerceiro,
      multaFGTS,
      totalBruto:
        saldoSalario + avisoPrevio + ferias + decimoTerceiro + multaFGTS,
    },
  };
}

// Execução
const resultado = calcularRescisaoCompleta(dadosRescisao);

console.log("=== CÁLCULO DE RESCISÃO TRABALHISTA ===\n");
console.log("INFORMAÇÕES:");
console.table(resultado.informacoes);
console.log("\nVERBAS RESCISÓRIAS:");
console.table(resultado.verbas);
console.log(
  `\nTOTAL A RECEBER: R$ ${resultado.verbas.totalBruto.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`
);

const dataInicio = new Date("2025-10-25");
const dataFim = new Date("2025-12-25");
const salario = 1518;
const ferias = false;
const aviso = true;
const dias = 25;

const DIAS_POR_ANO = 365;
const DIAS_AVISO_BASE = 30;
const DIAS_ADICIONAIS_POR_ANO = 3;

function resto() {
  return Number(((salario / 30) * dias).toFixed(2));
}

function calcularDiasAvisoPrevio() {
  if (!aviso) return 0;

  const diferencaEmMs = dataFim - dataInicio;
  const umDiaEmMs = 24 * 60 * 60 * 1000;
  const diasTrabalhados = Math.floor(diferencaEmMs / umDiaEmMs);

  const anosCompletos = Math.floor(diasTrabalhados / DIAS_POR_ANO);
  const diasCalculados =
    DIAS_AVISO_BASE + anosCompletos * DIAS_ADICIONAIS_POR_ANO;

  return Math.min(diasCalculados, 90);
}

function calcularMesesTrabalhados() {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  let meses = 0;
  const UM_DIA = 1000 * 60 * 60 * 24;

  while (inicio <= fim) {
    const ano = inicio.getFullYear();
    const mes = inicio.getMonth();

    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0);

    const inicioEfetivo = Math.max(inicio.getTime(), inicioMes.getTime());
    const fimEfetivo = Math.min(fim.getTime(), fimMes.getTime());

    const diasNoMes = Math.floor((fimEfetivo - inicioEfetivo) / UM_DIA) + 1;

    if (diasNoMes >= 15) meses++;

    inicio.setDate(1);
    inicio.setMonth(mes + 1);
  }

  return meses;
}

function calcularAvisoPrevio() {
  if (calcularMesesTrabalhados() < 3) return 0;

  const diasAviso = calcularDiasAvisoPrevio();
  return Number(((salario / 30) * diasAviso).toFixed(2));
}

function temDireitoAFerias() {
  return calcularMesesTrabalhados() >= 1;
}

function calcularFeriasTotal() {
  if (!temDireitoAFerias()) return 0;

  const meses = calcularMesesTrabalhados();
  let total = 0;

  // Férias vencidas
  if (meses >= 12) {
    total += salario + salario / 3;
  }

  // Férias proporcionais
  const mesesProporcionais = meses >= 12 ? meses - 12 : meses;

  if (mesesProporcionais > 0) {
    const base = (salario / 12) * mesesProporcionais;
    total += base + base / 3;
  }

  return Number(total.toFixed(2));
}

function calcularDecimoTerceiroProporcional() {
  const anoRescisao = dataFim.getFullYear();

  const inicioCalculo =
    dataInicio > new Date(anoRescisao, 0, 1)
      ? dataInicio
      : new Date(anoRescisao, 0, 1);

  let meses = 0;
  const UM_DIA = 1000 * 60 * 60 * 24;

  let data = new Date(inicioCalculo);

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

    if (dias >= 15) meses++;

    data.setMonth(mes + 1);
  }

  return Number(((salario / 12) * meses).toFixed(2));
}

function calcularTotal() {
  return (
    resto() +
    calcularFeriasTotal() +
    calcularAvisoPrevio() +
    calcularDecimoTerceiroProporcional()
  );
}

console.log(calcularTotal());

// MOTIVOS DE DEMISSÃO (para evitar strings mágicas)
export const MOTIVOS_DEMISSAO = {
  SEM_JUSTA_CAUSA: "sem_justa_causa",
  PEDIDO_DEMISSAO: "pedido_demissao",
  JUSTA_CAUSA: "justa_causa",
};

// --- CONFIGURAÇÃO PADRÃO DO CÁLCULO ---
// No futuro, isso virá do estado da aplicação React (useState)
export const dadosRescisaoPadrao = {
  dataInicio: new Date("2023-01-15"),
  dataFim: new Date("2025-12-25"),
  salarioBrutoEmCentavos: 151800, // R$ 1518,00
  avisoPrevioCumprido: false,
  feriasVencidasNaoGozadas: 1,
  motivoDemissao: MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA,
  dependentesIR: 0,
  pensaoAlimenticiaPercentual: 0,
};

// --- CONSTANTES LEGAIS E DE CÁLCULO ---
export const DIAS_AVISO_BASE = 30;
export const DIAS_ADICIONAIS_POR_ANO = 3;
export const DIAS_PARA_MES_COMPLETO = 15;
export const MESES_NO_ANO = 12;

// --- TABELAS DE IMPOSTOS E DEDUÇÕES ---
// Idealmente, em um app real, isso poderia vir de uma API para sempre estar atualizado.

// Tabela INSS 2025 (valores em centavos)
export const TABELA_INSS = [
  { ate: 141800, aliquota: 0.075 },
  { ate: 265080, aliquota: 0.09 },
  { ate: 397620, aliquota: 0.12 },
  { ate: 777420, aliquota: 0.14 },
];

// Tabela IRRF 2025 (valores em centavos)
export const TABELA_IR = [
  { ate: 211200, aliquota: 0, deducao: 0 },
  { ate: 280500, aliquota: 0.075, deducao: 15840 },
  { ate: 370300, aliquota: 0.15, deducao: 37062 },
  { ate: 466800, aliquota: 0.225, deducao: 90989 },
  { ate: Infinity, aliquota: 0.275, deducao: 124418 },
];

export const DEDUCAO_POR_DEPENDENTE_IR = 18959; // R$ 189,59

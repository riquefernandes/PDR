import { z } from "zod";
import { MOTIVOS_DEMISSAO, TIPOS_AVISO_PREVIO } from "./config";
import { parse, isValid } from 'date-fns';

// Obtém os valores do objeto MOTIVOS_DEMISSAO como uma tupla de strings para o z.enum
const motivosDemissaoValidos = Object.values(MOTIVOS_DEMISSAO) as [
  string,
  ...string[],
];

// Obtém os valores do objeto TIPOS_AVISO_PREVIO como uma tupla de strings para o z.enum
const tiposAvisoPrevioValidos = Object.values(TIPOS_AVISO_PREVIO) as [
  string,
  ...string[],
];

const dateSchema = z.string().refine(
  (val) => {
    if (!val || val.length < 10) return false; // "dd/mm/yyyy"
    const parsedDate = parse(val, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate);
  },
  {
    message: 'Data inválida. Use o formato dd/mm/yyyy.',
  }
).transform((val) => parse(val, 'dd/MM/yyyy', new Date()));

// Schema Zod para validação do formulário, compartilhado entre cliente e servidor.
export const FormSchema = z.object({
  dataInicio: dateSchema,
  dataFim: dateSchema,
  salarioBruto: z.coerce
    .number({
      error: "O salário bruto deve ser um número válido.",
    })
    .positive("O salário deve ser um número positivo."),
  motivoDemissao: z.enum(motivosDemissaoValidos, {
    error: "O motivo da demissão é obrigatório.",
  }),
  tipoAvisoPrevio: z.enum(tiposAvisoPrevioValidos, {
    error: "O tipo de aviso prévio é obrigatório.",
  }),
  // Campos que podem ser "vazios" ou zero, com valores padrão.
  feriasVencidasNaoGozadas: z.coerce
    .number({
      error: "O valor de férias vencidas deve ser um número.",
    })
    .min(0, "O número não pode ser negativo.")
    .default(0),
  dependentesIR: z.coerce
    .number({
      error: "O número de dependentes deve ser um número.",
    })
    .min(0, "O número não pode ser negativo.")
    .default(0),
  pensaoAlimenticiaPercentual: z.coerce
    .number({
      error: "O valor da pensão deve ser um número.",
    })
    .min(0, "A porcentagem não pode ser negativa.")
    .max(100, "A porcentagem não pode ser maior que 100.")
    .default(0),
});
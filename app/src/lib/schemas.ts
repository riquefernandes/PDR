import { z } from "zod";
import { MOTIVOS_DEMISSAO } from "./config";

// Obtém os valores do objeto MOTIVOS_DEMISSAO como uma tupla de strings para o z.enum
const motivosDemissaoValidos = Object.values(MOTIVOS_DEMISSAO) as [string, ...string[]];

// Schema Zod para validação do formulário, compartilhado entre cliente e servidor.
export const FormSchema = z.object({
  dataInicio: z.coerce.date({
    error: "Data de início inválida ou não preenchida."
  }),
  dataFim: z.coerce.date({
    error: "Data de fim inválida ou não preenchida."
  }),
  salarioBruto: z.coerce
    .number({
      error: "O salário bruto deve ser um número válido.",
    })
    .positive("O salário deve ser um número positivo."),
  motivoDemissao: z.enum(motivosDemissaoValidos, {
    error: "O motivo da demissão é obrigatório.",
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
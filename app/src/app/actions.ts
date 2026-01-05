"use server";

import { calcularRescisaoCompleta } from "@/lib/calculation-engine";
import { FormSchema } from "@/lib/schemas";

export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
  data?: ReturnType<typeof calcularRescisaoCompleta> | null;
};

export async function calculate(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = FormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Por favor, corrija os campos destacados.",
      data: null,
    };
  }

  try {
    const result = calcularRescisaoCompleta(validatedFields.data);
    return {
      message: "Cálculo realizado com sucesso!",
      data: result,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.",
      data: null,
    };
  }
}
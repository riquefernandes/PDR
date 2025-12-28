"use client";

import { calculate, State } from "@/app/actions";
import { MOTIVOS_DEMISSAO, TIPOS_AVISO_PREVIO } from "@/lib/config";
import { FormSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import CalculationResults from "./CalculationResults";
import DateInput from "./ui/date-input";

type FormData = z.infer<typeof FormSchema>;

export default function CalculatorForm() {
  const initialState: State = { message: null, errors: {}, data: null };
  const [state, dispatch] = useActionState(calculate, initialState);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dataInicio: "",
      dataFim: "",
      salarioBruto: 0,
      motivoDemissao: MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA,
      tipoAvisoPrevio: TIPOS_AVISO_PREVIO.NAO_SE_APLICA,
      feriasVencidasNaoGozadas: 0,
      dependentesIR: 0,
      pensaoAlimenticiaPercentual: 0,
    },
  });

  useEffect(() => {
    if (state.errors) {
      console.log("Errors from server:", state.errors);
      for (const [field, messages] of Object.entries(state.errors)) {
        if (messages) {
          setError(field as keyof FormData, {
            type: "server",
            message: messages.join(", "),
          });
        }
      }
    }
  }, [state.errors, setError]);

  const onSubmit = handleSubmit((data) => {
    console.log("Data being sent to server:", data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, value.toLocaleDateString('pt-BR'));
      } else {
        formData.append(key, String(value));
      }
    });
    startTransition(() => {
      dispatch(formData);
    });
  });

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="space-y-8 bg-white p-8 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label
              htmlFor="dataInicio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Início do Contrato
            </label>
            <Controller
              name="dataInicio"
              control={control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  id="dataInicio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              )}
            />
            {errors.dataInicio && (
              <p className="text-sm text-red-500 mt-1">
                {errors.dataInicio.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="dataFim"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data Final da Rescisão
            </label>
            <Controller
              name="dataFim"
              control={control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  id="dataFim"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              )}
            />
            {errors.dataFim && (
              <p className="text-sm text-red-500 mt-1">
                {errors.dataFim.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <label
              htmlFor="salarioBruto"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Último Salário Bruto (R$)
            </label>
            <input
              type="number"
              id="salarioBruto"
              {...register("salarioBruto", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Ex: 2400.00"
              step="0.01"
            />
            {errors.salarioBruto && (
              <p className="text-sm text-red-500 mt-1">
                {errors.salarioBruto.message}
              </p>
            )}
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="motivoDemissao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motivo da Rescisão
            </label>
            <select
              id="motivoDemissao"
              {...register("motivoDemissao")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value={MOTIVOS_DEMISSAO.SEM_JUSTA_CAUSA}>
                Demissão sem justa causa
              </option>
              <option value={MOTIVOS_DEMISSAO.PEDIDO_DEMISSAO}>
                Pedido de demissão
              </option>
              <option value={MOTIVOS_DEMISSAO.JUSTA_CAUSA}>
                Demissão por justa causa
              </option>
            </select>
            {errors.motivoDemissao && (
              <p className="text-sm text-red-500 mt-1">
                {errors.motivoDemissao.message}
              </p>
            )}
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="tipoAvisoPrevio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Aviso Prévio
            </label>
            <select
              id="tipoAvisoPrevio"
              {...register("tipoAvisoPrevio")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value={TIPOS_AVISO_PREVIO.NAO_SE_APLICA}>
                Não se aplica
              </option>
              <option value={TIPOS_AVISO_PREVIO.INDENIZADO}>Indenizado</option>
              <option value={TIPOS_AVISO_PREVIO.TRABALHADO}>Trabalhado</option>
            </select>
            {errors.tipoAvisoPrevio && (
              <p className="text-sm text-red-500 mt-1">
                {errors.tipoAvisoPrevio.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-8">
          <div>
            <label
              htmlFor="feriasVencidasNaoGozadas"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nº Férias Vencidas
            </label>
            <input
              type="number"
              id="feriasVencidasNaoGozadas"
              {...register("feriasVencidasNaoGozadas", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              min="0"
            />
            {errors.feriasVencidasNaoGozadas && (
              <p className="text-sm text-red-500 mt-1">
                {errors.feriasVencidasNaoGozadas.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="dependentesIR"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dependentes no IR
            </label>
            <input
              type="number"
              id="dependentesIR"
              {...register("dependentesIR", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              min="0"
            />
            {errors.dependentesIR && (
              <p className="text-sm text-red-500 mt-1">
                {errors.dependentesIR.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="pensaoAlimenticiaPercentual"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pensão (%)
            </label>
            <input
              type="number"
              id="pensaoAlimenticiaPercentual"
              {...register("pensaoAlimenticiaPercentual", {
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              min="0"
              max="100"
            />
            {errors.pensaoAlimenticiaPercentual && (
              <p className="text-sm text-red-500 mt-1">
                {errors.pensaoAlimenticiaPercentual.message}
              </p>
            )}
          </div>
        </div>
        {state.message &&
          state.errors &&
          Object.keys(state.errors).length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4">
              <strong className="font-bold">Erro de Validação: </strong>
              <span className="block sm:inline">{state.message}</span>
            </div>
          )}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-gray-400"
            disabled={isPending}
          >
            {isPending ? "Calculando..." : "Calcular Rescisão"}
          </button>
        </div>
      </form>
      {state.data && (
        <div className="mt-8">
          <CalculationResults data={state.data} />
        </div>
      )}
    </div>
  );
}

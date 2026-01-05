"use client";

import { calculate, State } from "@/app/actions";
import { MOTIVOS_DEMISSAO, TIPOS_AVISO_PREVIO } from "@/lib/config";
import { FormSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import CalculationResults from "./CalculationResults";
import DateInput from "./ui/date-input";

type FormData = z.infer<typeof FormSchema>;

const commonInputClasses =
  "w-full px-3 py-2 bg-accents-1 border border-accents-2 rounded-md transition-colors focus:border-vercel-blue focus:outline-none";

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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, value.toLocaleDateString("pt-BR"));
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
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Seção 1: Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dataInicio" className="block text-sm text-accents-6 mb-2">
              Data de Início do Contrato
            </label>
            <Controller
              name="dataInicio"
              control={control}
              render={({ field }) => (
                <DateInput {...field} id="dataInicio" className={commonInputClasses} />
              )}
            />
            {errors.dataInicio && (
              <p className="text-sm text-red-500 mt-1">{errors.dataInicio.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="dataFim" className="block text-sm text-accents-6 mb-2">
              Data Final da Rescisão
            </label>
            <Controller
              name="dataFim"
              control={control}
              render={({ field }) => (
                <DateInput {...field} id="dataFim" className={commonInputClasses} />
              )}
            />
            {errors.dataFim && (
              <p className="text-sm text-red-500 mt-1">{errors.dataFim.message}</p>
            )}
          </div>
        </div>

        {/* Seção 2: Detalhes da Rescisão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="salarioBruto" className="block text-sm text-accents-6 mb-2">
              Último Salário Bruto (R$)
            </label>
            <input
              type="number"
              id="salarioBruto"
              {...register("salarioBruto", { valueAsNumber: true })}
              className={commonInputClasses}
              placeholder="Ex: 2400.00"
              step="0.01"
            />
            {errors.salarioBruto && (
              <p className="text-sm text-red-500 mt-1">{errors.salarioBruto.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="motivoDemissao" className="block text-sm text-accents-6 mb-2">
              Motivo da Rescisão
            </label>
            <select id="motivoDemissao" {...register("motivoDemissao")} className={commonInputClasses}>
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
              <p className="text-sm text-red-500 mt-1">{errors.motivoDemissao.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="tipoAvisoPrevio" className="block text-sm text-accents-6 mb-2">
              Aviso Prévio
            </label>
            <select id="tipoAvisoPrevio" {...register("tipoAvisoPrevio")} className={commonInputClasses}>
              <option value={TIPOS_AVISO_PREVIO.NAO_SE_APLICA}>
                Não se aplica
              </option>
              <option value={TIPOS_AVISO_PREVIO.INDENIZADO}>Indenizado</option>
              <option value={TIPOS_AVISO_PREVIO.TRABALHADO}>Trabalhado</option>
            </select>
            {errors.tipoAvisoPrevio && (
              <p className="text-sm text-red-500 mt-1">{errors.tipoAvisoPrevio.message}</p>
            )}
          </div>
        </div>

        {/* Seção 3: Detalhes Adicionais */}
        <div className="border-t border-accents-2 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="feriasVencidasNaoGozadas" className="block text-sm text-accents-6 mb-2">
              Nº Férias Vencidas
            </label>
            <input
              type="number"
              id="feriasVencidasNaoGozadas"
              {...register("feriasVencidasNaoGozadas", { valueAsNumber: true })}
              className={commonInputClasses}
              min="0"
            />
            {errors.feriasVencidasNaoGozadas && (
              <p className="text-sm text-red-500 mt-1">{errors.feriasVencidasNaoGozadas.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="dependentesIR" className="block text-sm text-accents-6 mb-2">
              Dependentes no IR
            </label>
            <input
              type="number"
              id="dependentesIR"
              {...register("dependentesIR", { valueAsNumber: true })}
              className={commonInputClasses}
              min="0"
            />
            {errors.dependentesIR && (
              <p className="text-sm text-red-500 mt-1">{errors.dependentesIR.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="pensaoAlimenticiaPercentual" className="block text-sm text-accents-6 mb-2">
              Pensão (%)
            </label>
            <input
              type="number"
              id="pensaoAlimenticiaPercentual"
              {...register("pensaoAlimenticiaPercentual", { valueAsNumber: true })}
              className={commonInputClasses}
              min="0"
              max="100"
            />
            {errors.pensaoAlimenticiaPercentual && (
              <p className="text-sm text-red-500 mt-1">{errors.pensaoAlimenticiaPercentual.message}</p>
            )}
          </div>
        </div>

        {/* Mensagem de Erro Global */}
        {state.message && state.errors && Object.keys(state.errors).length > 0 && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-md">
            <strong className="font-bold">Erro de Validação: </strong>
            <span className="block sm:inline">{state.message}</span>
          </div>
        )}

        {/* Botão de Submissão */}
        <div className="border-t border-accents-2 pt-6">
          <button
            type="submit"
            className="w-full bg-vercel-blue text-white font-bold py-3 px-4 rounded-md transition-all hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-vercel-blue disabled:bg-accents-2 disabled:text-accents-4 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? "Calculando..." : "Calcular Rescisão"}
          </button>
        </div>
      </form>
      
      {/* Resultados */}
      {state.data && (
        <div className="mt-12">
          <CalculationResults data={state.data} />
        </div>
      )}
    </div>
  );
}

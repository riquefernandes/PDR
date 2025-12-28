import React, { ReactNode } from "react";

// Definição da estrutura de dados esperada
interface CalculationResultsProps {
  data: {
    informacoes: { [key: string]: string | number };
    verbas: { [key: string]: string };
    descontos: { [key: string]: string };
    resumo: { [key: string]: string };
    fgts?: { [key: string]: string };
  };
}

// Componente para um item da linha de resultado
const ResultRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between items-center border-b border-accents-2 py-3 last:border-b-0">
    <span className="text-accents-6">{label}:</span>
    <span className="font-medium text-white">{value}</span>
  </div>
);

// Componente para um item de linha com valor colorido (verbas/descontos)
const ColorizedResultRow = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) => (
  <div className="flex justify-between items-center border-b border-accents-2 py-3 last:border-b-0">
    <span className="text-accents-6">{label}:</span>
    <span className={`font-bold ${colorClass}`}>{value}</span>
  </div>
);

// Componente de Card para agrupar seções de resultados
const ResultCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="bg-accents-1 border border-accents-2 rounded-lg overflow-hidden">
    <div className="p-4 border-b border-accents-2">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Componente principal de resultados
const CalculationResults: React.FC<CalculationResultsProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-vercel-cyan to-vercel-blue">
        Resumo da Rescisão
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card: Resumo Final */}
        <div className="md:col-span-2">
            <ResultCard title="Resumo Final">
                <div className="space-y-4">
                {Object.entries(data.resumo).map(([key, value]) => (
                    <div
                    key={key}
                    className="flex justify-between items-baseline border-b border-accents-2 py-3 last:border-b-0"
                    >
                    <span className="text-lg text-accents-6">{key}:</span>
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-vercel-cyan to-vercel-blue">
                        {value}
                    </span>
                    </div>
                ))}
                </div>
            </ResultCard>
        </div>
        
        {/* Card: Verbas Rescisórias */}
        <ResultCard title="Verbas Rescisórias">
          {Object.entries(data.verbas).map(([key, value]) => {
              if (key === "" || key === "TOTAL BRUTO") return null;
              return <ColorizedResultRow key={key} label={key} value={value} colorClass="text-green-400" />
            })}
        </ResultCard>

        {/* Card: Descontos */}
        <ResultCard title="Descontos">
          {Object.entries(data.descontos).map(([key, value]) => {
              if (key === "" || key === "TOTAL DESCONTOS") return null;
              return <ColorizedResultRow key={key} label={key} value={value} colorClass="text-red-400" />
            })}
        </ResultCard>

        {/* Card: Informações do Contrato */}
        <ResultCard title="Informações do Contrato">
          {Object.entries(data.informacoes).map(([key, value]) => (
            <ResultRow key={key} label={key} value={value} />
          ))}
        </ResultCard>

        {/* Card: FGTS */}
        {data.fgts && (
            <ResultCard title="Valores de FGTS">
            {Object.entries(data.fgts).map(([key, value]) => {
                if (key === "Observação") return null; // Será renderizado abaixo
                return <ResultRow key={key} label={key} value={value} />
            })}
             <p className="mt-4 text-sm text-accents-5">
                <strong>Observação:</strong> {data.fgts["Observação"]}
             </p>
            </ResultCard>
        )}
      </div>
    </div>
  );
};

export default CalculationResults;

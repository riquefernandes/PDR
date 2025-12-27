import React from "react";

interface CalculationResultsProps {
  data: {
    informacoes: { [key: string]: string | number };
    verbas: { [key: string]: string };
    descontos: { [key: string]: string };
    resumo: { [key: string]: string };
    fgts?: { [key: string]: string };
  };
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ data }) => {
  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Resumo da Rescisão</h2>

      {/* Seção de Informações do Contrato */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Informações do Contrato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.informacoes).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Verbas Rescisórias */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Verbas Rescisórias</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.verbas).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
              <span className="text-gray-600">{key}:</span>
              <span className="font-bold text-green-600">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de FGTS (Opcional) */}
      {data.fgts && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Valores de FGTS</h3>
          <div className="space-y-2">
            {Object.entries(data.fgts).map(([key, value]) => {
              if (key === "Observação") {
                return (
                  <p key={key} className="md:col-span-2 mt-2 text-sm text-gray-500">
                    <strong>{key}:</strong> {value}
                  </p>
                );
              }
              return (
                <div key={key} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-bold text-gray-800">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seção de Descontos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Descontos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.descontos).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
              <span className="text-gray-600">{key}:</span>
              <span className="font-bold text-red-600">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Resumo Final */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Resumo Final</h3>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(data.resumo).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
              <span className="text-gray-600">{key}:</span>
              <span className="text-2xl font-bold text-blue-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculationResults;

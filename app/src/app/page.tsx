import CalculatorForm from "@/components/CalculatorForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Calculadora de Rescisão CLT
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Calcule os valores da sua rescisão de contrato de trabalho de forma rápida e fácil.
          </p>
        </header>
        
        <CalculatorForm />
      </div>
    </main>
  );
}

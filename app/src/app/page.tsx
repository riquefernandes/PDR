"use client";

import CalculatorForm from "@/components/CalculatorForm";
import { Intro } from "@/components/intro";
import { useEffect, useState } from "react";

export default function Home() {
  const [showIntro, setShowIntro] = useState(false); // Default to false

  useEffect(() => {
    // A animação de introdução só será exibida uma vez por sessão
    const visited = sessionStorage.getItem("visited");
    if (!visited) {
      setShowIntro(true);
      sessionStorage.setItem("visited", "true");
    }
  }, []);

  return (
    <>
      {showIntro && <Intro onFinish={() => setShowIntro(false)} />}

      <div className="mx-auto max-w-4xl w-full px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-accents-5">
            Calculadora de Rescisão CLT
          </h1>
          <p className="text-lg text-accents-6 mt-4 max-w-2xl mx-auto">
            Preencha os campos abaixo para simular os valores da sua rescisão de
            contrato de trabalho de forma rápida e precisa.
          </p>
        </div>

        <CalculatorForm />
      </div>
    </>
  );
}

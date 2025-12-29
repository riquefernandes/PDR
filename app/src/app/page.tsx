"use client";

import CalculatorForm from "@/components/CalculatorForm";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Intro = dynamic(
  () => import("@/components/intro").then((mod) => mod.Intro),
  { ssr: false }
);

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visited");
    if (!hasVisited) {
      setShowIntro(true);
      sessionStorage.setItem("visited", "true");
    }
  }, []);

  return (
    <>
      {showIntro && <Intro onFinish={() => setShowIntro(false)} />}

      <div className="mx-auto max-w-4xl w-full px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-sky-50">
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

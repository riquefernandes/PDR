"use client";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import { useEffect, useRef } from "react";

interface IntroProps {
  onFinish: () => void;
}

export function Intro({ onFinish }: IntroProps) {
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!textRef.current || !wrapperRef.current) return;

    // 1️⃣ Split do texto
    const split = new SplitText(textRef.current, {
      type: "chars",
      charsClass: "split-char",
    });

    // 2️⃣ Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        split.revert(); // limpa DOM
        onFinish();     // remove a intro
      },
    });

    // 3️⃣ Entrada do texto
    tl.fromTo(
      split.chars,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
      }
    )

    // 4️⃣ Pequena pausa
    .to({}, { duration: 0.4 })

    // 5️⃣ Fade-out da tela inteira
    .to(wrapperRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      split.revert();
    };
  }, [onFinish]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <h1
        ref={textRef}
        className="text-white text-4xl md:text-6xl font-bold text-center"
      >
        Calculadora de Rescisão CLT
      </h1>
    </div>
  );
}

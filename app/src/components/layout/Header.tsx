// src/components/layout/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-8">
        <div className="flex h-16 items-center justify-between border-b border-accents-2">
          <Link href="/" className="text-lg font-bold">
            Calculadora de Rescisão
          </Link>
          <nav>
            {/* Futuros links para o blog, etc. */}
          </nav>
        </div>
      </div>
    </header>
  );
}

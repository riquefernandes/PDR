"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black">
      <div className="mx-auto flex h-14 items-center justify-between px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <svg
            width="23"
            height="20"
            viewBox="0 0 23 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path d="M11.5 0L0 20H23L11.5 0Z" fill="currentColor" />
          </svg>
          <div className="flex items-baseline gap-0">
            <span className="font-sans text-lg font-bold tracking-tight text-white">PDR</span>
          
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#Calculo" className="text-sm font-normal text-gray-400 transition-colors hover:text-white">
            Calculo Rescisão
          </a>
          <a href="#blog" className="text-sm font-normal text-gray-400 transition-colors hover:text-white">
            Blog
          </a>
          <a href="#faq" className="text-sm font-normal text-gray-400 transition-colors hover:text-white">
            FAQ
          </a>
          
        </nav>

        {/* Right Section - Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search documentation..."
              className="h-9 w-72 rounded-md border-white/10 bg-white/5 pl-10 pr-20 text-sm text-white placeholder:text-gray-500 focus-visible:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs font-medium text-gray-300">
              <span className="text-xs">⌘</span>
              <span>K</span>
            </kbd>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hidden text-sm font-normal text-gray-400 hover:bg-white/5 hover:text-white md:inline-flex"
          >
            Feedback
          </Button>

          <Button size="sm" className="rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-gray-200">
            Learn
          </Button>
        </div>
      </div>
    </header>
  )
}

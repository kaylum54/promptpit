'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300
      ${mounted && scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm'
        : 'bg-transparent'
      }
    `}>
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="PromptPit"
            className="h-14 w-auto"
            suppressHydrationWarning
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="#features"
            className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/examples"
            className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            Examples
          </Link>
          <Link
            href="/arena"
            className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            AI Compare
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-gray-600 hover:text-black transition-colors text-sm font-medium hidden sm:inline px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="bg-black text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-all hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

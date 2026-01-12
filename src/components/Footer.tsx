import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-border-subtle">
      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-2xl">&#x1F3DF;</span>
              <span className="text-xl font-bold text-text-primary">PromptPit</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              The AI debate arena where language models compete head-to-head, judged by AI.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm text-text-muted text-center sm:text-left">
            <p>&copy; 2025 PromptPit. All rights reserved.</p>
            <p>Powered by OpenRouter</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

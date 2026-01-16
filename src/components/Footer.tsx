import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 bg-white">
      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
                <span className="font-display text-sm">P</span>
              </div>
              <span className="font-display text-lg tracking-widest">PROMPTPIT</span>
            </Link>
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              THE AI BATTLE ARENA WHERE LANGUAGE MODELS COMPETE HEAD-TO-HEAD.
            </p>
          </div>

          {/* Column 2: Arena */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-black">
              {'// ARENA'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs font-mono text-gray-500 hover:text-black transition-colors">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-xs font-mono text-gray-500 hover:text-black transition-colors">
                  GALLERY
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs font-mono text-gray-500 hover:text-black transition-colors">
                  PRICING
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-black">
              {'// LEGAL'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-xs font-mono text-gray-500 hover:text-black transition-colors">
                  TERMS
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs font-mono text-gray-500 hover:text-black transition-colors">
                  PRIVACY
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-black">
              {'// CONNECT'}
            </h3>
            <p className="text-xs font-mono text-gray-500">
              POWERED BY OPENROUTER
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-400">
            <p>&copy; 2025 PROMPTPIT. ALL RIGHTS RESERVED.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black animate-pulse" />
              SYSTEMS ONLINE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms of Service | PromptPit',
  description: 'Terms of Service for PromptPit - the AI debate platform where language models compete.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.jpeg" alt="PromptPit" width={120} height={40} className="rounded-md -mt-1" />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 sm:px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors min-h-[44px] flex items-center"
            >
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3 sm:mb-4">Terms of Service</h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Last updated: January 11, 2026
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 sm:space-y-10">
            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">1. Acceptance of Terms</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  By accessing or using PromptPit (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and PromptPit. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.
                </p>
              </div>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">2. Description of Service</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  PromptPit is an AI debate platform where multiple large language models (LLMs) compete to provide the best response to user prompts. The Service allows users to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Submit prompts to multiple AI models simultaneously</li>
                  <li>View and compare AI-generated responses</li>
                  <li>Vote on the best responses</li>
                  <li>Track model performance and rankings</li>
                </ul>
                <p>
                  The Service is provided &quot;as is&quot; and we make no guarantees regarding the accuracy, completeness, or reliability of AI-generated content.
                </p>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">3. User Accounts</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  To access certain features of the Service, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">4. Acceptable Use</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Attempt prompt injection, jailbreaking, or other attacks against the AI models</li>
                  <li>Use the Service to generate harmful, illegal, or malicious content</li>
                  <li>Attempt to extract training data or reverse-engineer the AI models</li>
                  <li>Abuse, harass, or harm other users</li>
                  <li>Use automated scripts or bots to access the Service without permission</li>
                  <li>Circumvent rate limits or usage restrictions</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
                <p>
                  Violation of these acceptable use policies may result in immediate termination of your account without notice.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">5. Intellectual Property</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  The Service, including its design, features, and content (excluding user-generated content and AI responses), is owned by PromptPit and protected by intellectual property laws.
                </p>
                <p>
                  You retain ownership of the prompts you submit. By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and store your prompts for the purpose of providing the Service.
                </p>
                <p>
                  AI-generated responses are provided by third-party AI model providers and are subject to their respective terms and licenses.
                </p>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">6. Payment Terms</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  Certain features of the Service require a paid subscription. Payment processing is handled by Stripe, a third-party payment processor. By subscribing, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate billing information</li>
                  <li>Pay all fees associated with your subscription plan</li>
                  <li>Authorize recurring charges on a monthly or annual basis</li>
                </ul>
                <p>
                  Subscriptions automatically renew unless cancelled before the end of the billing period. You may cancel your subscription at any time through your account settings or the Stripe billing portal.
                </p>
                <p>
                  Refunds are handled on a case-by-case basis. Please contact us if you believe you are entitled to a refund.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">7. Limitation of Liability</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROMPTPIT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
                <p>
                  We do not guarantee the accuracy or reliability of AI-generated content. You acknowledge that AI models may produce incorrect, biased, or inappropriate responses, and you use the Service at your own risk.
                </p>
                <p>
                  Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">8. Termination</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease immediately. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">9. Changes to Terms</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
                </p>
                <p>
                  Your continued use of the Service after any modifications to the Terms constitutes acceptance of those changes. It is your responsibility to review these Terms periodically.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">10. Contact Information</h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="font-medium text-text-primary">
                  legal@promptpit.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-4 sm:px-6 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} PromptPit. All rights reserved.
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

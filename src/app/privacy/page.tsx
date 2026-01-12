import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PromptPit',
  description: 'Learn how PromptPit collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3 sm:mb-4">Privacy Policy</h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Last updated: January 11, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-text-secondary">
            {/* Introduction */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Introduction</h2>
              <p className="leading-relaxed">
                Welcome to PromptPit. We are committed to protecting your personal information and your
                right to privacy. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI debate platform.
              </p>
              <p className="leading-relaxed mt-4">
                By using PromptPit, you agree to the collection and use of information in accordance
                with this policy. If you do not agree with our policies and practices, please do not
                use our service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Information We Collect</h2>

              <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">Account Information</h3>
              <p className="leading-relaxed">
                When you create an account, we collect information such as your email address,
                username, and authentication credentials. This information is necessary to provide
                you with access to our services.
              </p>

              <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">Usage Data</h3>
              <p className="leading-relaxed">
                We automatically collect certain information when you access and use PromptPit,
                including your IP address, browser type, operating system, referring URLs, pages
                viewed, and the dates and times of your visits.
              </p>

              <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">Debate Content</h3>
              <p className="leading-relaxed">
                We store the debate topics you create, the AI responses generated during debates,
                your votes, and any comments or interactions you make on the platform. This data
                is used to provide the core functionality of our service.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, operate, and maintain our services</li>
                <li>Process your transactions and manage your subscription</li>
                <li>Improve, personalize, and expand our services</li>
                <li>Understand and analyze how you use our platform</li>
                <li>Communicate with you about updates, security alerts, and support</li>
                <li>Detect, prevent, and address technical issues or fraudulent activity</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Data Storage</h2>
              <p className="leading-relaxed">
                Your data is stored securely using Supabase, a trusted database platform with
                enterprise-grade security. We implement appropriate technical and organizational
                measures to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction.
              </p>
              <p className="leading-relaxed mt-4">
                Data may be transferred to and stored on servers located outside your country of
                residence. By using our service, you consent to such transfers.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Third-Party Services</h2>
              <p className="leading-relaxed mb-4">
                We use the following third-party services to operate PromptPit:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-medium text-text-primary">Stripe</span> - For secure payment
                  processing. Stripe collects and processes your payment information according to
                  their privacy policy.
                </li>
                <li>
                  <span className="font-medium text-text-primary">OpenRouter</span> - For AI model
                  access. Debate prompts and responses are processed through OpenRouter to generate
                  AI debate content.
                </li>
                <li>
                  <span className="font-medium text-text-primary">Supabase</span> - For database
                  storage and authentication services.
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                These third parties have their own privacy policies governing the use of your
                information. We encourage you to review their policies.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service
                and store certain information. Cookies are files with a small amount of data that
                may include an anonymous unique identifier.
              </p>
              <p className="leading-relaxed mt-4">
                We use cookies for authentication, preferences, and analytics purposes. You can
                instruct your browser to refuse all cookies or indicate when a cookie is being
                sent. However, if you do not accept cookies, you may not be able to use some
                features of our service.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as your account is active or as
                needed to provide you with our services. We may also retain and use your
                information as necessary to comply with legal obligations, resolve disputes,
                and enforce our agreements.
              </p>
              <p className="leading-relaxed mt-4">
                If you delete your account, we will delete or anonymize your personal information
                within 30 days, except where we are required to retain it for legal or regulatory
                purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your
                personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><span className="font-medium text-text-primary">Access</span> - Request a copy of your personal data</li>
                <li><span className="font-medium text-text-primary">Correction</span> - Request correction of inaccurate data</li>
                <li><span className="font-medium text-text-primary">Deletion</span> - Request deletion of your personal data</li>
                <li><span className="font-medium text-text-primary">Portability</span> - Request transfer of your data to another service</li>
                <li><span className="font-medium text-text-primary">Objection</span> - Object to certain processing of your data</li>
                <li><span className="font-medium text-text-primary">Restriction</span> - Request restriction of processing your data</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise any of these rights, please contact us using the information provided
                below.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                PromptPit is not intended for use by individuals under the age of 13. We do not
                knowingly collect personal information from children under 13. If we become aware
                that we have collected personal information from a child under 13, we will take
                steps to delete that information promptly.
              </p>
              <p className="leading-relaxed mt-4">
                If you are a parent or guardian and believe your child has provided us with
                personal information, please contact us so we can take appropriate action.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the
                &quot;Last updated&quot; date at the top of this policy.
              </p>
              <p className="leading-relaxed mt-4">
                We encourage you to review this Privacy Policy periodically for any changes.
                Changes are effective when they are posted on this page. Your continued use of
                the service after any modifications indicates your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices,
                please contact us at:
              </p>
              <p className="leading-relaxed mt-4">
                <span className="font-medium text-text-primary">Email:</span>{' '}
                <a
                  href="mailto:privacy@promptpit.com"
                  className="text-accent-primary hover:text-accent-hover transition-colors"
                >
                  privacy@promptpit.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-4 sm:px-6 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} PromptPit. All rights reserved.
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Terms of Service
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

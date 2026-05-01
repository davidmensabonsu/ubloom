import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DataProtection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-background px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <h1 className="text-2xl font-display font-bold text-foreground">Data Protection</h1>
          <p className="text-xs text-muted-foreground">Last updated: [DATE — to be completed by solicitor]</p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Your data is deeply personal — mood logs, journal entries, health information, and the conversations you
            have with Ubi. We treat all of it with the care it deserves. This page explains the specific measures we
            take to protect it.
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Sensitive data we hold</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some of the information you share with uBloom is classified as special-category (sensitive) data under
              UK/EU GDPR. This includes:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Daily mood check-ins and emotion selections</li>
              <li>Journal entries (text and voice recordings)</li>
              <li>Menstrual cycle and health tracking data</li>
              <li>AI mentor conversations (including memories Ubi stores to personalise your experience)</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We process this data based on your <strong>explicit consent</strong>, which you give when you voluntarily
              enter it into the app. You can delete any of it at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. How we protect your data</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Encryption in transit</strong> — all data is transmitted over HTTPS/TLS</li>
              <li><strong>Encryption at rest</strong> — database and file storage are encrypted at rest</li>
              <li><strong>Row-level security</strong> — strict database policies ensure you can only access your own data; no other user can see it</li>
              <li><strong>Private storage buckets</strong> — voice recordings and images are stored in private, authenticated buckets</li>
              <li><strong>No plain-text passwords</strong> — authentication credentials are securely hashed</li>
              <li><strong>Minimal third-party access</strong> — AI providers receive only the text of your prompts, never your identity</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Who can see your data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Only you.</strong> uBloom is a private, personal space. We do not share, sell, or provide your
              personal data to advertisers or data brokers. Our team may access anonymised, aggregated analytics to
              improve the app, but individual records are never viewed unless you explicitly contact us for support
              and grant permission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Data retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We keep your data for as long as your account is active. When you delete your account (Profile → Delete
              my account), everything is permanently removed — database records, stored files, AI conversation history,
              and analytics. Stripe may retain payment transaction records separately in accordance with financial
              regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Your rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Under UK/EU GDPR you have the right to:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Access</strong> — request a copy of all your data</li>
              <li><strong>Rectification</strong> — correct anything that is inaccurate</li>
              <li><strong>Erasure</strong> — delete your account and all associated data at any time</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Withdraw consent</strong> — stop us processing your data (by deleting your account)</li>
              <li><strong>Complain</strong> — lodge a complaint with the ICO (UK) or your local supervisory authority</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Data breach procedure</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In the unlikely event of a data breach affecting your personal data, we will notify the relevant
              supervisory authority within 72 hours and inform you directly if the breach poses a high risk to your
              rights and freedoms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any data protection queries or to exercise your rights, please contact:<br />
              [YOUR DATA PROTECTION CONTACT EMAIL]<br />
              [YOUR COMPANY NAME / YOUR NAME]<br />
              [YOUR ADDRESS]
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
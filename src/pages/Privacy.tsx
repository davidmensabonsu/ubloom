import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Privacy() {
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
          <h1 className="text-2xl font-display font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: [DATE — to be completed by solicitor]</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Who We Are</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is operated by [YOUR COMPANY NAME / YOUR NAME], registered at [YOUR ADDRESS].
              We are the data controller for the personal data we collect through the uBloom application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Data We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We collect the following categories of personal data:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Account information</strong> — email address, display name, profile picture (optional)</li>
              <li><strong>Authentication data</strong> — login credentials (hashed), Google OAuth tokens where applicable</li>
              <li><strong>Mood &amp; wellness data</strong> — daily mood check-in responses, emotion selections, alignment scores</li>
              <li><strong>Journal entries</strong> — text entries and optional voice recordings stored in encrypted storage</li>
              <li><strong>Routine &amp; habit data</strong> — custom habits, completion records, streaks, reminder preferences</li>
              <li><strong>Identity &amp; vision data</strong> — Dream Self blueprint statements, vision board images</li>
              <li><strong>Health data</strong> — menstrual cycle tracking data (period dates, cycle length, symptoms)</li>
              <li><strong>Moodboard content</strong> — saved images and quotes</li>
              <li><strong>AI conversation data</strong> — messages exchanged with the Ubi AI mentor, including extracted memories used to personalise responses</li>
              <li><strong>Wander activity</strong> — saved resources, browsing preferences, interest selections</li>
              <li><strong>Subscription &amp; billing data</strong> — processed by Stripe; we store your Stripe customer ID, subscription status, and billing period but do not store payment card details</li>
              <li><strong>Analytics events</strong> — page views, feature usage, and engagement metrics (anonymised where possible)</li>
              <li><strong>Device &amp; technical data</strong> — browser type, screen size, and local storage preferences</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>To provide and personalise the uBloom experience</li>
              <li>To generate AI-powered insights, daily focus messages, and mentor responses</li>
              <li>To track your progress and display mood trends, streaks, and alignment scores</li>
              <li>To process subscription payments through Stripe</li>
              <li>To improve the app through anonymised usage analytics</li>
              <li>To send transactional emails (account verification, password resets)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Legal Basis for Processing (GDPR)</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Consent</strong> — you consent to data processing when you create an account and accept these terms</li>
              <li><strong>Contract performance</strong> — processing necessary to provide the uBloom service</li>
              <li><strong>Legitimate interests</strong> — anonymised analytics to improve the app</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Special Category Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some data we collect — such as mood logs, health/cycle data, and wellness journal entries — may be
              considered special category (sensitive) data under GDPR. We process this data based on your
              <strong> explicit consent</strong>, which you provide when you voluntarily enter this information into
              the app. You can delete this data at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Data Storage &amp; Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard infrastructure. Database access is protected by
              row-level security policies ensuring you can only access your own data. Files (images, voice recordings)
              are stored in private, encrypted storage buckets. All data is transmitted over HTTPS.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Third-Party Services</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
              <li><strong>Google</strong> — OAuth authentication (when you sign in with Google)</li>
              <li><strong>AI providers</strong> — AI model providers process your prompts to generate responses; we do not share your identity with these providers</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. When you delete your account, all associated
              data is permanently deleted from our systems, including database records, stored files, and AI conversation
              history. Stripe may retain transaction records in accordance with their own retention policies and legal
              obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Your Rights (GDPR / UK GDPR)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — correct inaccurate personal data</li>
              <li><strong>Erasure</strong> — delete your account and all associated data (available in-app via Profile → Delete my account)</li>
              <li><strong>Data portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Withdraw consent</strong> — at any time, without affecting the lawfulness of prior processing</li>
              <li><strong>Lodge a complaint</strong> — with the ICO (UK) or your local supervisory authority</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. Cookies &amp; Local Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom uses browser local storage to persist your preferences, theme selection, and session state. We do
              not use third-party tracking cookies. Authentication tokens are stored securely in local storage and are
              required for the app to function.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">11. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is not intended for children under 16. We do not knowingly collect data from children under 16. If
              you believe a child has provided us with personal data, please contact us and we will delete it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">12. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes via email
              or an in-app notice. Continued use of uBloom after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">13. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions about this privacy policy or to exercise your data rights, please contact:<br />
              [YOUR CONTACT EMAIL]<br />
              [YOUR COMPANY NAME / YOUR NAME]<br />
              [YOUR ADDRESS]
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
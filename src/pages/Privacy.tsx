import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-background px-4 pt-[max(2rem,calc(env(safe-area-inset-top)+0.75rem))] pb-24">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 py-2 hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <h1 className="text-2xl font-display font-bold text-foreground">uBloom — Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 2026</p>

          {/* 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Who We Are</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is a personal wellness and self-growth application operated by Ubloom, registered at Dubai, United Arab Emirates ("we", "us", "our"). We are the data controller for all personal data collected through the uBloom application.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For all data protection inquiries please contact us at ubloomsupport@gmail.com.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are registered with the Information Commissioner's Office (ICO) under registration number [ICO REGISTRATION NUMBER — to be added once registered].
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Our Commitment to Your Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is deeply personal. The mood logs, journal entries, cycle data, and conversations you have with Ubi represent some of the most intimate information a person can share. We treat all of it with the care it deserves.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">We make the following commitments to you:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>We never sell your personal data to any third party</li>
              <li>We never use your personal data for advertising purposes</li>
              <li>We never share your data with data brokers</li>
              <li>Our team never reads your individual journal entries, mood logs, or Ubi conversations unless you explicitly contact us for support and grant us permission to do so</li>
              <li>We only collect data that is necessary to provide the uBloom service</li>
              <li>AI providers that power Ubi receive only the text content of your prompts — never your name, email address, or any identifying information</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">3. Data We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We collect the following categories of personal data:</p>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Account and identity data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Email address and display name</li>
                <li>Profile picture (optional, if provided)</li>
                <li>Authentication credentials (passwords are hashed and never stored in plain text)</li>
                <li>Google OAuth tokens where you choose to sign in with Google</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Health and wellbeing data (special category)</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Menstrual cycle data — period start dates, cycle length, period length, phase history</li>
                <li>Daily mood check-in responses and emotional state selections</li>
                <li>Mood history and emotional pattern data over time</li>
                <li>Journal entries — text content, dates, and mood associations</li>
                <li>Voice journal recordings — audio files stored in encrypted private storage</li>
                <li>Bloom Score — a calculated daily wellness indicator derived from mood, habits, cycle phase, and consistency data</li>
                <li>Health data manually entered — sleep hours, activity minutes, recovery level</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Routine and habit data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Custom habits and to-do items you create</li>
                <li>Habit completion records and streak data</li>
                <li>Reminder preferences and notification settings</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">AI interaction data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Messages exchanged with Ubi, our AI mentor</li>
                <li>Ubi onboarding answers — preferred name, life stage, focus area, struggles, communication preferences, and personal statements</li>
                <li>AI-extracted memory entries — important information Ubi has identified from your conversations to personalize future responses</li>
                <li>AI-generated content — intentions, journal prompts, weekly summaries, and cycle insights generated for you</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Identity and vision data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Dream Self statements and goal categories</li>
                <li>Vision board images and moodboard content</li>
                <li>Identity statements and future self notes</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Content and activity data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Wander content saves and recently viewed resources</li>
                <li>Aesthetic and theme preferences</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Subscription and billing data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Stripe customer ID and subscription ID</li>
                <li>Subscription status, plan type, and billing period end date</li>
                <li>Subscription history and audit log entries</li>
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed ml-2">
                <strong>Note:</strong> payment card details are processed and stored exclusively by Stripe — we never see or store your card number, expiration date, or CVV
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Technical and analytics data</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Browser type and screen size</li>
                <li>Feature usage and engagement events (anonymized where possible)</li>
                <li>Local storage data for session persistence and app state</li>
                <li>Error logs for debugging purposes</li>
              </ul>
            </div>
          </section>

          {/* 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Special Category Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under UK GDPR and GDPR, certain categories of personal data require additional protections. uBloom collects and processes the following special category data:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Health data</strong> — menstrual cycle information, sleep data, activity data, recovery data</li>
              <li><strong>Mental wellbeing data</strong> — mood logs, journal entries, emotional check-in responses</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We process this special category data based on your <strong>explicit consent</strong>, provided when you voluntarily enter this information into the app and agree to this Privacy Policy. You have the right to withdraw this consent at any time by deleting your account or contacting us at ubloomsupport@gmail.com.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We rely on Article 9(2)(a) of UK GDPR — explicit consent — as our condition for processing special category data.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can delete any special category data at any time directly within the app or by deleting your account entirely.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. AI Processing of Your Personal Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom uses artificial intelligence to provide personalized features. This involves automated processing of your personal data including special category health and wellbeing data. Specifically:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Ubi mentor responses</strong> — your messages, cycle data, mood history, habit data, journal excerpts, and AI memory entries are assembled into a context profile and sent to an AI language model to generate Ubi's responses. AI providers receive only the text content — never your name, email address, or any identifying information</li>
              <li><strong>Memory extraction</strong> — after conversations with Ubi, an AI model analyzes the conversation and extracts important information to store as memories that personalize future responses</li>
              <li><strong>Daily intentions</strong> — your cycle phase, mood state, and personal data are used by an AI model to generate your daily intention</li>
              <li><strong>Journal prompts</strong> — your cycle phase and recent mood data are processed by an AI to generate personalized daily journal prompts</li>
              <li><strong>Weekly summaries</strong> — your weekly data including mood logs, habit completions, and cycle phase are processed by an AI to generate a personalized weekly letter</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Your rights regarding automated processing:</strong> You have the right not to be subject to solely automated decisions that produce significant legal or similarly significant effects on you. The AI features in uBloom are designed to support and inform your wellness journey — they don't make binding decisions about you. If you have concerns about automated processing of your data please contact us at ubloomsupport@gmail.com.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can limit AI processing of your data by choosing not to use Ubi or by deleting your account entirely.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. How We Use Your Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We use your personal data for the following purposes:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>To create and manage your uBloom account</li>
              <li>To provide the uBloom service including all features described in Section 3</li>
              <li>To personalize your experience based on your cycle phase, mood, and personal data</li>
              <li>To generate AI-powered insights, intentions, journal prompts, and mentor responses through Ubi</li>
              <li>To track your progress and display mood trends, habit streaks, and Bloom Score</li>
              <li>To process your subscription payments through Stripe</li>
              <li>To send transactional communications — account verification, password resets, subscription confirmations, and trial expiration notices</li>
              <li>To improve the app through anonymized usage analytics</li>
              <li>To comply with our legal obligations</li>
              <li>To protect against fraud and misuse of the service</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Legal Basis for Processing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We process your personal data under the following legal bases as defined by UK GDPR:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Data Type</th>
                    <th className="text-left py-2 font-semibold text-foreground">Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-3">Account data</td><td className="py-2">Contract performance — necessary to provide the service</td></tr>
                  <tr><td className="py-2 pr-3">Health and cycle data</td><td className="py-2">Explicit consent (Article 6(1)(a) and Article 9(2)(a))</td></tr>
                  <tr><td className="py-2 pr-3">Mood and wellbeing data</td><td className="py-2">Explicit consent (Article 6(1)(a) and Article 9(2)(a))</td></tr>
                  <tr><td className="py-2 pr-3">Journal entries</td><td className="py-2">Explicit consent (Article 6(1)(a) and Article 9(2)(a))</td></tr>
                  <tr><td className="py-2 pr-3">AI conversation data</td><td className="py-2">Explicit consent (Article 6(1)(a))</td></tr>
                  <tr><td className="py-2 pr-3">Subscription data</td><td className="py-2">Contract performance and legal obligation</td></tr>
                  <tr><td className="py-2 pr-3">Analytics data</td><td className="py-2">Legitimate interests — improving the app and service</td></tr>
                  <tr><td className="py-2 pr-3">Error logs</td><td className="py-2">Legitimate interests — maintaining security and stability</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For our legitimate interests processing we have assessed that our interests do not override your fundamental rights and freedoms. You have the right to object to legitimate interests processing by contacting us at ubloomsupport@gmail.com.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. How We Protect Your Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We implement the following security measures to protect your personal data:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Encryption in transit</strong> — all data is transmitted over HTTPS/TLS encrypted connections</li>
              <li><strong>Encryption at rest</strong> — all database records and stored files are encrypted at rest</li>
              <li><strong>Row-level security</strong> — strict database policies ensure you can only access your own data. No other user can ever access your records</li>
              <li><strong>Private storage buckets</strong> — voice recordings and images are stored in private authenticated storage buckets inaccessible to any other user</li>
              <li><strong>No plain-text passwords</strong> — authentication credentials are securely hashed using industry-standard algorithms and never stored in plain text</li>
              <li><strong>Minimal third-party exposure</strong> — AI providers receive only the text content of your prompts, never your identity or contact details</li>
              <li><strong>Limited internal access</strong> — our team never accesses individual user records unless you explicitly contact us for support and grant permission. We only access anonymized aggregated analytics to improve the app</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Data breach notification:</strong> In the unlikely event of a personal data breach affecting your personal data we will notify the ICO within 72 hours of becoming aware of the breach as required by UK GDPR. Where the breach poses a high risk to your rights and freedoms we will also notify you directly without undue delay, explaining what happened, what data was affected, and what steps we are taking.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Who Can Access Your Data</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>You</strong> — full access to all your personal data within the app at all times.</li>
              <li><strong>Our team</strong> — we never read your individual journal entries, mood logs, Ubi conversations, or cycle data. We only access anonymized aggregated analytics (such as total active users or feature usage rates) to improve the app. Individual records are never viewed unless you explicitly contact us for support and grant us permission to do so.</li>
              <li><strong>Third-party service providers</strong> — as described in Section 10 below, limited data is shared with service providers solely to operate the app.</li>
              <li><strong>No one else</strong> — we never sell, share, rent, or provide your personal data to advertisers, data brokers, or any other third parties.</li>
              <li><strong>Law enforcement</strong> — we may disclose data if required to do so by law or in response to a valid legal request from a competent authority. We will notify you of such a request where legally permitted to do so.</li>
            </ul>
          </section>

          {/* 10 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We use the following third-party services to operate uBloom:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Service</th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Data Shared</th>
                    <th className="text-left py-2 font-semibold text-foreground">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-3">Stripe</td>
                    <td className="py-2 pr-3">Payment processing</td>
                    <td className="py-2 pr-3">Email, subscription details</td>
                    <td className="py-2"><a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Supabase</td>
                    <td className="py-2 pr-3">Database and file storage</td>
                    <td className="py-2 pr-3">All app data</td>
                    <td className="py-2"><a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Google</td>
                    <td className="py-2 pr-3">OAuth authentication (optional)</td>
                    <td className="py-2 pr-3">Email address</td>
                    <td className="py-2"><a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">AI model providers</td>
                    <td className="py-2 pr-3">Powering Ubi and generated content</td>
                    <td className="py-2 pr-3">Message content only — no identity data</td>
                    <td className="py-2">Via our secure backend</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not use any third-party advertising networks, social media tracking pixels, or behavioral analytics tools. We do not use Google Analytics, Facebook Pixel, or any similar tracking technology.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">11. International Data Transfers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">uBloom uses third-party services that may process or store your data outside the United Kingdom:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Supabase</strong> — your data may be stored in data centers within the European Economic Area or United States depending on your region. Where data is transferred outside the UK, appropriate safeguards are in place including standard contractual clauses approved by the ICO</li>
              <li><strong>Stripe</strong> — payment data is processed by Stripe Inc., a US-based company. Stripe complies with applicable data protection frameworks including standard contractual clauses for UK-US transfers</li>
              <li><strong>AI model providers</strong> — AI processing occurs via our secure backend infrastructure. Only message content is transmitted — never your identity</li>
            </ul>
          </section>

          {/* 12 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">12. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We retain your personal data for the following periods:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Data Type</th>
                    <th className="text-left py-2 font-semibold text-foreground">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-3">Account and profile data</td><td className="py-2">Retained while account is active. Deleted within 30 days of account deletion</td></tr>
                  <tr><td className="py-2 pr-3">Health and cycle data</td><td className="py-2">Retained while account is active. Deleted within 30 days of account deletion</td></tr>
                  <tr><td className="py-2 pr-3">Mood and journal data</td><td className="py-2">Retained while account is active. Deleted within 30 days of account deletion</td></tr>
                  <tr><td className="py-2 pr-3">AI conversation history</td><td className="py-2">Retained while account is active. Deleted within 30 days of account deletion</td></tr>
                  <tr><td className="py-2 pr-3">AI memory entries</td><td className="py-2">Retained while account is active. Deleted within 30 days of account deletion</td></tr>
                  <tr><td className="py-2 pr-3">Subscription records</td><td className="py-2">Retained for 7 years from transaction date for legal and tax compliance</td></tr>
                  <tr><td className="py-2 pr-3">Analytics events</td><td className="py-2">Retained for 24 months then permanently deleted</td></tr>
                  <tr><td className="py-2 pr-3">Error logs</td><td className="py-2">Retained for 90 days then permanently deleted</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you delete your account all personal data in the first five categories above will be permanently and irreversibly deleted from our systems within 30 days. This action cannot be undone. Subscription transaction records are retained for 7 years as required by UK tax law regardless of account deletion.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">13. Your Rights Under UK GDPR</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
              <li><strong>Right of access</strong> — You may request a copy of all personal data we hold about you. We will respond within 30 days free of charge.</li>
              <li><strong>Right to rectification</strong> — You may correct any inaccurate or incomplete personal data. Most data can be updated directly within the app.</li>
              <li><strong>Right to erasure (right to be forgotten)</strong> — You may request deletion of your account and all associated personal data using the Delete Account feature in Profile settings or by contacting us at ubloomsupport@gmail.com. We will process deletion within 30 days.</li>
              <li><strong>Right to data portability</strong> — You may request your personal data in a structured, commonly used, machine-readable format. Contact us at ubloomsupport@gmail.com to make this request.</li>
              <li><strong>Right to restrict processing</strong> — You may request that we restrict processing of your personal data in certain circumstances — for example while a complaint is being investigated.</li>
              <li><strong>Right to object</strong> — You may object to processing based on legitimate interests at any time. You may also object to automated AI processing of your personal data.</li>
              <li><strong>Right to withdraw consent</strong> — You may withdraw your consent to processing of special category data at any time without affecting the lawfulness of processing before withdrawal. To withdraw consent delete your account or contact us at ubloomsupport@gmail.com.</li>
              <li><strong>Right to lodge a complaint</strong> — If you believe we have not handled your personal data correctly you have the right to lodge a complaint with the Information Commissioner's Office at <a href="https://ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or by calling 0303 123 1113.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To exercise any of these rights please contact us at ubloomsupport@gmail.com. We will respond within 30 days and may need to verify your identity before processing your request.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">14. Cookies and Local Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">uBloom uses browser local storage — not traditional tracking cookies — to store the following:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Item</th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-3">Authentication token</td><td className="py-2 pr-3">Keeps you logged in</td><td className="py-2">Until you log out or token expires</td></tr>
                  <tr><td className="py-2 pr-3">App state and preferences</td><td className="py-2 pr-3">Saves your theme, settings, and recent activity</td><td className="py-2">Until you clear browser storage or delete account</td></tr>
                  <tr><td className="py-2 pr-3">Profile data cache</td><td className="py-2 pr-3">Caches your profile locally for performance</td><td className="py-2">Until you clear browser storage or delete account</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not use any third-party tracking cookies, advertising cookies, or analytics cookies. We do not use Google Analytics, Facebook Pixel, or any similar tracking technology.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can clear local storage data at any time through your browser settings. Note that clearing local storage will log you out of uBloom and may temporarily affect app performance until data reloads from the cloud.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">15. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is strictly intended for users aged 18 and over. We do not knowingly collect personal data from anyone under the age of 18. The special category health and wellbeing data we process requires users to be adults capable of providing informed explicit consent.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe a person under 18 has created an account or provided us with personal data please contact us immediately at ubloomsupport@gmail.com. We will immediately suspend the account and permanently delete all associated data.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">16. Medical Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is a wellness application and is not a medical device. Nothing in uBloom — including cycle tracking, mood logging, Bloom Score, health insights, or Ubi's responses — constitutes medical advice, diagnosis, or treatment. uBloom should not be used as a substitute for professional medical care.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cycle tracking data provided by uBloom must not be used as a method of contraception or family planning.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any health concerns please consult a qualified healthcare professional.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">17. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our data processing activities, legal requirements, or service features. Where changes are material we will notify you by email or via an in-app notification at least 30 days before the changes take effect.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your continued use of uBloom after the effective date of any changes constitutes your acceptance of the updated policy. If you do not accept the updated policy you may delete your account before the changes take effect.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The date at the top of this document shows when it was last updated.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">18. Contact Us and Data Subject Requests</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions about this Privacy Policy, to exercise your data rights, or to make a data subject access request please contact:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ubloom<br />
              Dubai, United Arab Emirates<br />
              ubloomsupport@gmail.com
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We aim to respond to all data protection inquiries within 30 days.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you are not satisfied with our response you have the right to lodge a complaint with the Information Commissioner's Office:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Information Commissioner's Office<br />
              Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF<br />
              <a href="https://ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a><br />
              0303 123 1113
            </p>
          </section>

          <section className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              This Privacy Policy was drafted specifically for uBloom and incorporates the requirements of UK GDPR, the Data Protection Act 2018, and PECR. It should be reviewed by a qualified UK solicitor with expertise in data protection law before the app is made publicly available to a significant user base. Given that uBloom processes special category health and mental wellbeing data, a Data Protection Impact Assessment (DPIA) is strongly recommended before public launch.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
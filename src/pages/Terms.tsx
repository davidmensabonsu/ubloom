import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Terms() {
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
          <h1 className="text-2xl font-display font-bold text-foreground">Terms &amp; Conditions</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 2026</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. About uBloom</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is a personal wellness and self-growth application designed to help you build positive daily routines, track your mood and menstrual cycle, journal, explore curated wellness content, and engage with an AI-powered mentor called Ubi.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is operated by Ubloom, registered at Dubai, United Arab Emirates, and directed by Jojo Carter. For all legal and operational enquiries, please contact us at ubloom@gmail.com.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account or using uBloom in any capacity, you agree to be legally bound by these Terms and Conditions, our Privacy Policy, and our Cookie Policy. These documents form the entire agreement between you and uBloom.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you do not agree with any part of these terms, you must not use the app. Continued use of uBloom following any updates to these terms constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be at least 18 years of age to use uBloom. By creating an account, you confirm that you are 18 or older. uBloom collects special category personal data including health, cycle, and mental wellbeing data. We do not knowingly collect data from anyone under the age of 18. If we become aware that a user is under 18, we will immediately suspend their account and delete all associated data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Geographic Scope and Applicable Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is primarily directed at users in the United Kingdom. However, the app is internationally accessible. Users based in the United Arab Emirates, the European Union, the United States, and other jurisdictions may use uBloom subject to these terms.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where you are based in the UAE, your use of uBloom is subject to applicable UAE laws in addition to these terms. Where you are based in the EU, your rights under the General Data Protection Regulation (GDPR) apply. Where you are based in the UK, UK GDPR and the Data Protection Act 2018 apply.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These terms are governed by the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales, unless mandatory local consumer protection laws in your jurisdiction provide otherwise.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Account Registration and Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To use uBloom you must create an account using a valid email address and password, or via a supported third-party authentication provider. You agree to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your login credentials confidential at all times</li>
              <li>Not share your account with anyone else</li>
              <li>Notify us immediately at ubloom@gmail.com if you suspect any unauthorized access to your account</li>
              <li>Take responsibility for all activity that occurs under your account</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts where we have reason to believe credentials have been compromised or shared.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. The uBloom Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom provides a personal wellness platform including but not limited to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>AI-powered mentoring through Ubi</li>
              <li>Menstrual cycle tracking and phase-based insights</li>
              <li>Mood logging and emotional pattern tracking</li>
              <li>Private journaling with text, voice, and video modes (Premium)</li>
              <li>Daily intentions and wellness content</li>
              <li>Curated content library via the Wander feature</li>
              <li>Routine and habit tracking</li>
              <li>Bloom Score — a personalized daily wellness indicator</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The features available to you depend on whether you are on the free tier or a Premium subscription as described in Section 9.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any feature of the service at any time with reasonable notice where possible.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. AI Mentor Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ubi is an artificial intelligence mentor powered by large language model technology. Ubi provides general wellness guidance, reflective prompts, cycle-phase insights, and motivational support based on the personal data you share with the app.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">You acknowledge and agree that:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Ubi is not a medical professional, psychologist, therapist, or counselor</li>
              <li>Nothing Ubi says constitutes medical advice, psychological advice, therapeutic advice, or diagnosis of any kind</li>
              <li>Ubi's responses are AI-generated and may not always be accurate, appropriate, or applicable to your specific circumstances</li>
              <li>You should not rely on Ubi as a substitute for professional medical or mental health care</li>
              <li>If you are experiencing a mental health crisis, suicidal thoughts, or any medical emergency, you must contact a qualified healthcare professional or emergency services immediately</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom and its operators accept no liability for any decisions made or actions taken based on Ubi's responses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Health and Cycle Tracking Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom's cycle tracking, mood logging, Bloom Score, and health insight features are provided for personal awareness and general wellness purposes only. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Cycle tracking data provided by uBloom is not medically validated and does not constitute medical advice or diagnosis</li>
              <li>uBloom is not a medical device and has not been approved or regulated as one by any health authority</li>
              <li>Cycle tracking within uBloom must not be used as a method of contraception or family planning</li>
              <li>Bloom Score is a wellness indicator calculated from self-reported and app-generated data and is not a clinical health metric</li>
              <li>Health insights generated by Ubi are AI-generated and are not a substitute for advice from a qualified healthcare professional</li>
              <li>You should always consult a qualified medical professional regarding any health concerns, menstrual irregularities, or symptoms</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom and its operators accept no liability for any health outcomes, decisions, or actions arising from your use of these features.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Subscriptions, Billing, and Free Trial</h2>

            <h3 className="text-sm font-semibold text-foreground mt-3">Free Tier</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom offers a free tier providing limited access to core features as described on the pricing page. Free tier users are subject to usage limits including a cap on daily Ubi messages, journal entries, and Wander library access.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Premium Subscription</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom Premium provides unlimited access to all features. Premium is available at the following prices:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Monthly plan: £4.99 per month</li>
              <li>Annual plan: £39.99 per year (equivalent to £3.33 per month)</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prices are displayed inclusive of any applicable taxes. We reserve the right to change pricing with 30 days notice to existing subscribers.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Free Trial</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              New users may be eligible for a 3-day free trial of uBloom Premium. To access the free trial you must provide valid payment details. Your payment method will not be charged during the trial period. At the end of the 3-day trial your subscription will automatically renew at the selected plan price unless you cancel before the trial ends. It is your responsibility to cancel before the trial period expires if you do not wish to be charged.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Billing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscriptions are billed on a recurring basis through Stripe. By subscribing you authorize uBloom to charge your payment method on a recurring basis at the applicable subscription price until you cancel. You are responsible for ensuring your payment details remain valid and up to date.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Cancellation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time from the Profile page within the app or by contacting us at ubloom@gmail.com. Cancellation takes effect at the end of your current billing period. You will retain access to Premium features until that date.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Refund Policy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All payments made to uBloom are non-refundable. This includes monthly and annual subscription payments and any partial periods. By subscribing you acknowledge and agree to this no-refund policy. This does not affect your statutory rights under applicable consumer protection law where mandatory refund rights cannot be excluded.
            </p>

            <h3 className="text-sm font-semibold text-foreground mt-3">Failed Payments</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If a payment fails, we will attempt to process it again. If payment cannot be collected your account will revert to the free tier until payment is successfully processed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. User-Generated Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Content you create within uBloom — including journal entries, voice notes, video journal entries, vision board images, moodboard items, identity statements, and any other content you input — remains your intellectual property at all times.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You grant uBloom a limited, non-exclusive, royalty-free license to store, process, and display your content solely for the purpose of providing the uBloom service to you. This license terminates when you delete the relevant content or delete your account.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We will never sell, share, or use your personal content for any purpose other than providing the service to you, as described in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">11. Acceptable Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">By using uBloom you agree not to:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Use the app for any illegal purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any part of the service or its underlying infrastructure</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the app</li>
              <li>Use the app to harass, harm, or intimidate any other person</li>
              <li>Attempt to circumvent subscription restrictions or access Premium features without a valid subscription</li>
              <li>Upload or transmit any malicious code, virus, or harmful content</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Use automated tools, bots, or scripts to interact with the service</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate any account that violates these terms without notice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">12. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom, including its name, logo, design, technology, content, and all associated intellectual property rights, is owned by Ubloom and protected by applicable intellectual property laws. Nothing in these terms grants you any rights to use uBloom's intellectual property other than as necessary to use the service in accordance with these terms.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The uBloom flower logo, the Ubi AI mentor concept, the Bloom Score system, and all original content within the app are proprietary to uBloom.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">13. Data Protection and Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is committed to protecting your personal data. Our Privacy Policy explains in full what data we collect, why we collect it, how it is stored and processed, and what rights you have.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">By using uBloom you acknowledge that:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>We collect and process special category personal data including health, cycle, and mental wellbeing data</li>
              <li>This data is processed by AI systems to provide personalized features</li>
              <li>Your data is stored securely using industry-standard infrastructure</li>
              <li>Your payment data is processed by Stripe and is never stored directly by uBloom</li>
              <li>You have the right to access, correct, port, and delete your personal data at any time</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To exercise your data rights or to request deletion of your account and all associated data, please use the Delete Account feature in the Profile page or contact us at ubloom@gmail.com. All data deletion requests will be processed within 30 days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">14. Account Deletion</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can delete your account at any time from the Profile page within the app. Upon account deletion:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>All your personal data will be permanently deleted from our systems within 30 days</li>
              <li>All journal entries, mood logs, cycle data, Ubi conversations, and memory data will be permanently removed</li>
              <li>Any active Premium subscription will be canceled effective immediately with no refund for any remaining subscription period</li>
              <li>This action is irreversible and deleted data cannot be recovered</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">15. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">To the fullest extent permitted by applicable law:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>uBloom is provided on an "as is" and "as available" basis without warranties of any kind, express or implied</li>
              <li>We do not warrant that the service will be uninterrupted, error-free, or entirely secure</li>
              <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service</li>
              <li>Our total liability to you for any claim arising from these terms or your use of the service shall not exceed the amount you paid to uBloom in the 12 months preceding the claim</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited under applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">16. Dispute Resolution</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In the event of any dispute arising from these terms or your use of uBloom, you agree to first contact us at ubloom@gmail.com and allow 30 days for us to attempt to resolve the dispute in good faith before initiating any formal legal proceedings.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nothing in this clause prevents you from seeking urgent injunctive relief or from exercising any mandatory statutory rights available to you under applicable consumer protection law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">17. Changes to These Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to update these Terms and Conditions at any time. Where changes are material we will notify you by email or via an in-app notification at least 30 days before the changes take effect. Your continued use of uBloom after the effective date of any changes constitutes your acceptance of the updated terms.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you do not agree to the updated terms you may cancel your subscription and delete your account before the changes take effect.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">18. Severability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If any provision of these terms is found to be invalid, unlawful, or unenforceable, that provision shall be deemed severed from the remaining terms which shall continue in full force and effect.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">19. Entire Agreement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms and Conditions, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and uBloom regarding your use of the service and supersede all prior agreements, representations, and understandings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">20. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions, concerns, or legal notices regarding these Terms and Conditions, please contact:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ubloom<br />
              Dubai, United Arab Emirates<br />
              ubloom@gmail.com
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
              These Terms and Conditions were drafted for uBloom and should be reviewed by a qualified UK solicitor before the app is made publicly available to a significant user base.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
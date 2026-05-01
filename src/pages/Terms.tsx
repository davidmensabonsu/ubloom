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
          <p className="text-xs text-muted-foreground">Last updated: [DATE — to be completed by solicitor]</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. About uBloom</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is a personal wellness and self-growth application designed to help you build positive daily routines,
              track your mood, journal, explore curated resources, and engage with an AI-powered mentor called Ubi.
              uBloom is operated by [YOUR COMPANY NAME / YOUR NAME], registered at [YOUR ADDRESS].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account or using uBloom, you agree to be bound by these Terms and Conditions and our
              Privacy Policy. If you do not agree, please do not use the app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be at least 16 years of age to use uBloom. By using the app, you represent that you meet this
              requirement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Account &amp; Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and for all activity under
              your account. Please notify us immediately if you suspect unauthorised access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. AI Mentor Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ubi, the AI mentor within uBloom, provides general wellness guidance and reflective prompts. Ubi is
              <strong> not a substitute for professional medical, psychological, or therapeutic advice</strong>. If you
              are experiencing a mental health crisis, please contact a qualified professional or emergency services
              immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Health Data Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Features such as mood tracking, cycle tracking, and health insights are provided for personal awareness
              only and do not constitute medical advice or diagnosis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. User-Generated Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Content you create within uBloom — including journal entries, vision board images, moodboard items, and
              identity statements — remains yours. We do not claim ownership of your content. However, you grant us a
              limited licence to store and process this content solely to provide the service to you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Subscriptions &amp; Billing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom offers a free tier and a paid "uBloom Premium" subscription. Premium subscriptions are billed
              through Stripe on a recurring basis. You may cancel at any time; access continues until the end of your
              current billing period. Refunds are handled in accordance with applicable consumer protection laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may delete your account at any time from the Profile page. Upon deletion, all your data will be
              permanently removed and any active subscription will be cancelled. We reserve the right to suspend or
              terminate accounts that violate these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we
              shall not be liable for any indirect, incidental, or consequential damages arising from your use of the
              app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">11. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These terms are governed by the laws of [JURISDICTION — e.g. England and Wales]. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of [JURISDICTION].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">12. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about these terms, please contact us at [YOUR CONTACT EMAIL].
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
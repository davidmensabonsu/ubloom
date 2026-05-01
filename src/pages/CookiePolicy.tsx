import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CookiePolicy() {
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
          <h1 className="text-2xl font-display font-bold text-foreground">uBloom — Cookie Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: [DATE]</p>

          {/* 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. What Are Cookies?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files that websites place on your device to store information. They are widely used to make websites and applications work efficiently and to provide information to the owners of the site.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Local storage" is a similar browser technology that allows websites to store data locally on your device. It works like cookies but can hold more data and does not expire automatically.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. How uBloom Uses Cookies and Local Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom does <strong>not</strong> use traditional HTTP cookies for tracking, advertising, or analytics purposes. We do not set any third-party cookies.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Instead, uBloom uses <strong>browser local storage</strong> — a privacy-friendly alternative — to store the minimum data needed to keep you logged in and to remember your preferences. This data never leaves your device unless you explicitly sync it with your account.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. What We Store Locally</h2>
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
                  <tr>
                    <td className="py-2 pr-3">Authentication token</td>
                    <td className="py-2 pr-3">Keeps you securely logged in so you don't have to sign in every time</td>
                    <td className="py-2">Until you log out or the token expires</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">App state and preferences</td>
                    <td className="py-2 pr-3">Remembers your chosen theme, settings, and recent activity for a smooth experience</td>
                    <td className="py-2">Until you clear browser storage or delete your account</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Profile data cache</td>
                    <td className="py-2 pr-3">Caches your profile locally so the app loads faster</td>
                    <td className="py-2">Until you clear browser storage or delete your account</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All locally stored data is strictly necessary for the app to function. We do not store any optional or non-essential data.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Third-Party Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom does <strong>not</strong> use any third-party cookies. We do not use:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Google Analytics or any analytics cookies</li>
              <li>Facebook Pixel or any social media tracking pixels</li>
              <li>Advertising cookies or retargeting cookies</li>
              <li>Any behavioural tracking technology</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you sign in with Google, Google may set its own cookies on the Google sign-in page. These are governed by <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a> and are not controlled by uBloom.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you make a payment, Stripe may set cookies on the Stripe checkout page. These are governed by <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe's Privacy Policy</a> and are not controlled by uBloom.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. How to Manage Local Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can clear local storage data at any time through your browser settings. The exact steps depend on your browser:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><strong>Chrome</strong> — Settings → Privacy and Security → Clear Browsing Data → select "Cookies and other site data"</li>
              <li><strong>Safari</strong> — Settings → Privacy → Manage Website Data → find uBloom and remove</li>
              <li><strong>Firefox</strong> — Settings → Privacy & Security → Cookies and Site Data → Manage Data</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please note that clearing local storage will log you out of uBloom. Your data is safely stored in the cloud and will reload when you sign back in.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Do Not Track</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              uBloom respects "Do Not Track" browser signals. Since we do not use any tracking cookies or third-party tracking technology, your experience is the same regardless of your Do Not Track settings.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Where changes are material we will notify you by email or via an in-app notification. The date at the top of this document shows when it was last updated.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Cookie Policy please contact us at:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              [COMPANY NAME]<br />
              [REGISTERED ADDRESS]<br />
              [CONTACT EMAIL]
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
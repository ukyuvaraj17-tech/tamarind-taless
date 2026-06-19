import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', padding: '48px 44px 40px' }}>
        <div className="container">
          <hr className="hairline" style={{ marginBottom: 14 }} />
          <p className="eyebrow" style={{ marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: 'var(--iv)', lineHeight: 1 }}>
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 44px', maxWidth: 860 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 6 }}>Last updated: June 2026</p>
          <p style={{ marginBottom: 32, fontSize: 17, color: 'var(--iv)' }}>
            Tamarind Taless respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
          </p>
          {[
            { title: '1. Data We Collect', body: 'We collect name, email address, phone number, delivery address, and payment information when you place an order or create an account. We also collect browsing data such as pages visited and time spent, to improve our website experience.' },
            { title: '2. How We Use Your Data', body: 'Your data is used to process orders, communicate order status, send relevant updates about new arrivals or offers (only if you opt in), and improve our website. We do not sell or share your personal data with third parties for marketing purposes.' },
            { title: '3. Data Storage & Security', body: 'Your data is stored securely on Supabase servers hosted in the South Asia (Mumbai) region. We use industry-standard encryption and access controls. Payment data is processed by Razorpay and is never stored on our servers.' },
            { title: '4. Cookies', body: 'We use essential cookies to keep you logged in and maintain your cart. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though some features may not function correctly.' },
            { title: '5. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. To make a request, contact us on WhatsApp or email. We will respond within 7 business days.' },
            { title: '6. Third-Party Services', body: 'We use Supabase (database), Razorpay (payments), Cloudinary (image hosting), and Vercel (hosting). Each of these services has their own privacy policies. We share only the minimum data necessary for each service to function.' },
            { title: '7. Children\'s Privacy', body: 'Our website is not directed at children under 18. We do not knowingly collect data from minors. If you believe we have inadvertently collected such data, please contact us immediately.' },
            { title: '8. Changes to This Policy', body: 'We may update this policy periodically. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the updated policy.' },
            { title: '9. Contact', body: 'For privacy-related queries, contact us on WhatsApp at +91 87969 88216. We take all privacy concerns seriously and will respond within 3 business days.' },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12, fontWeight: 500 }}>{title}</h2>
              <p style={{ color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function Terms() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', padding: '48px 44px 40px' }}>
        <div className="container">
          <hr className="hairline" style={{ marginBottom: 14 }} />
          <p className="eyebrow" style={{ marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: 'var(--iv)', lineHeight: 1 }}>
            Terms &amp; Conditions
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 44px', maxWidth: 860 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>

          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 6 }}>Last updated: June 2026</p>
          <p style={{ marginBottom: 32, fontSize: 17 }}>Please read these Terms and Conditions carefully before using the Tamarind Taless website. By accessing or placing an order, you agree to be bound by these terms.</p>

          {[
            {
              title: '1. About Tamarind Taless',
              body: `Tamarind Taless is a heritage artefact curation brand based in India, with operations in Noida and Coimbatore. We curate rare bronzes, wooden art, temple paintings, brass, and miniatures sourced directly from artisan communities across India. All pieces are authentic, one-of-a-kind or limited-edition heritage objects.`
            },
            {
              title: '2. Product Authenticity',
              body: `All artefacts listed on our website are genuine heritage pieces. Descriptions of origin, material, period, and provenance are provided in good faith based on our curation research and artisan knowledge. Tamarind Taless does not guarantee specific age or archaeological certification unless explicitly stated. Minor variations in colour, texture, and finish are inherent to handcrafted objects and do not constitute defects.`
            },
            {
              title: '3. Pricing & Payment',
              body: `All prices are listed in Indian Rupees (INR) inclusive of applicable taxes. Prices are subject to change without prior notice. Payment is accepted via UPI, debit card, credit card, and net banking through our secure payment gateway. For enquiry-only pieces, pricing is shared directly via WhatsApp after reviewing the piece and delivery location.`
            },
            {
              title: '4. Orders & Confirmation',
              body: `An order is confirmed only after successful payment and a confirmation message from Tamarind Taless. We reserve the right to cancel any order in case of pricing errors, stock discrepancy, or suspected fraudulent activity. In such cases, a full refund will be processed within 5–7 business days.`
            },
            {
              title: '5. Shipping & Delivery',
              body: `We ship across India and to select international destinations. Delivery timelines vary by location and piece. Fragile artefacts are carefully packed in protective materials. Risk of loss or damage passes to the buyer upon handover to the courier. Tamarind Taless is not liable for delays caused by courier partners, natural events, or customs clearance.`
            },
            {
              title: '6. Intellectual Property',
              body: `All content on this website — including photographs, descriptions, brand identity, and design — is the intellectual property of Tamarind Taless. Reproduction, redistribution, or commercial use of any content without written permission is strictly prohibited.`
            },
            {
              title: '7. User Accounts',
              body: `You are responsible for maintaining the confidentiality of your account credentials. Tamarind Taless reserves the right to suspend or terminate accounts used for fraudulent, abusive, or unauthorised activity.`
            },
            {
              title: '8. Limitation of Liability',
              body: `To the maximum extent permitted by law, Tamarind Taless shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability to you shall not exceed the amount paid for the specific order in question.`
            },
            {
              title: '9. Governing Law',
              body: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.`
            },
            {
              title: '10. Contact Us',
              body: `For any questions regarding these Terms and Conditions, please reach us at: +91 87969 88216 or via WhatsApp. We are happy to clarify any aspect of our policies before you make a purchase.`
            },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12, fontWeight: 500 }}>{title}</h2>
              <p style={{ color: 'rgba(248,236,216,.88)', lineHeight: 1.9, fontSize: 16 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

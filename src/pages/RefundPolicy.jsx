import React from 'react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', padding: '48px 44px 40px' }}>
        <div className="container">
          <hr className="hairline" style={{ marginBottom: 14 }} />
          <p className="eyebrow" style={{ marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: 'var(--iv)', lineHeight: 1 }}>
            Refund &amp; Return Policy
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 44px', maxWidth: 860 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>

          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 6 }}>Last updated: June 2026</p>
          <p style={{ marginBottom: 32, fontSize: 17, color: 'var(--iv)' }}>
            At Tamarind Taless, each piece is a unique heritage artefact — handled with extraordinary care from source to your doorstep. We want you to love what you receive. Here is our complete policy.
          </p>

          {/* HIGHLIGHT BOX */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderLeft: '3px solid var(--gd)', padding: '20px 24px', marginBottom: 40 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 8 }}>Our Promise</p>
            <p style={{ fontSize: 16, color: 'var(--iv)', lineHeight: 1.8 }}>We accept returns within <strong style={{ color: 'var(--iv)' }}>7 days</strong> of delivery for damaged or incorrectly delivered pieces. For all other cases, we encourage you to speak with us directly before placing your order — we are happy to share detailed photos, videos, and condition reports.</p>
          </div>

          {[
            {
              title: '1. Eligible Returns',
              items: [
                'Item received is significantly different from the description on the website',
                'Item is damaged in transit (must be reported within 48 hours of delivery with photo evidence)',
                'Wrong item delivered',
              ],
              note: 'To initiate a return, contact us on WhatsApp (+91 87969 88216) with your order ID and photographs within 7 days of delivery.'
            },
            {
              title: '2. Non-Returnable Items',
              items: [
                'Items returned after 7 days of delivery',
                'Items that have been used, cleaned, or altered',
                'Customised or commissioned pieces',
                'Items purchased during sale or at a discounted price',
                'Enquiry-only pieces where pricing was agreed via WhatsApp',
              ],
              note: null
            },
            {
              title: '3. Return Process',
              steps: [
                'Contact us on WhatsApp with your order ID and reason for return',
                'Send clear photographs of the item and packaging',
                'Our team will review and approve the return within 2 business days',
                'Pack the item securely in its original packaging and ship to our address',
                'Refund or replacement will be processed within 5–7 business days of receiving the item',
              ],
              note: 'Return shipping costs are borne by the buyer unless the return is due to our error.'
            },
            {
              title: '4. Refund Method',
              body: 'Approved refunds are processed to the original payment method. UPI and card payments are refunded within 5–7 business days. Bank transfer refunds may take up to 10 business days depending on your bank. We will notify you via WhatsApp once the refund has been initiated.'
            },
            {
              title: '5. Exchanges',
              body: 'We do not offer direct exchanges as each piece is unique and one-of-a-kind. If your return is approved, you may place a fresh order for another piece once the refund is processed.'
            },
            {
              title: '6. Cancellations',
              body: 'Orders can be cancelled within 12 hours of placement for a full refund. After 12 hours, cancellation may not be possible if the item has been dispatched. For enquiry-only orders confirmed via WhatsApp, cancellation terms will be discussed case by case.'
            },
            {
              title: '7. Damaged in Transit',
              body: 'If your piece arrives damaged, please photograph the packaging and the item immediately and send it to us on WhatsApp within 48 hours of delivery. We will work with you to resolve this — either through a replacement (subject to availability) or a full refund.'
            },
          ].map(({ title, body, items, steps, note }) => (
            <div key={title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12, fontWeight: 500 }}>{title}</h2>
              {body && <p style={{ color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>{body}</p>}
              {items && (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, color: 'rgba(248,236,216,.88)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--crimson)', flexShrink: 0, marginTop: 3 }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {steps && (
                <ol style={{ listStyle: 'none', paddingLeft: 0, counterReset: 'steps' }}>
                  {steps.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 10, color: 'rgba(248,236,216,.88)', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: 'var(--gd)', flexShrink: 0, minWidth: 20 }}>{String(i+1).padStart(2,'0')}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {note && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: 'italic', color: 'var(--gd)', marginTop: 12, opacity: .8 }}>{note}</p>}
            </div>
          ))}

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 10 }}>Need Help?</p>
            <p style={{ fontSize: 16, color: 'rgba(248,236,216,.88)', marginBottom: 16 }}>Our team is available on WhatsApp for any questions about returns, refunds, or your order.</p>
            <a href="https://wa.me/918796988216?text=I have a question about my order" target="_blank" rel="noreferrer" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 10 }}>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

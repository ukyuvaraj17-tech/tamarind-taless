import React from 'react';

export default function ShippingPolicy() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--nav)', borderBottom: '1px solid var(--line)', padding: '48px 44px 40px' }}>
        <div className="container">
          <hr className="hairline" style={{ marginBottom: 14 }} />
          <p className="eyebrow" style={{ marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: 'var(--iv)', lineHeight: 1 }}>
            Shipping Policy
          </h1>
        </div>
      </div>
      <div className="container" style={{ padding: '56px 44px', maxWidth: 860 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(248,236,216,.88)', lineHeight: 1.9 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.2em', color: 'var(--gd)', textTransform: 'uppercase', marginBottom: 6 }}>Last updated: June 2026</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 44 }}>
            {[
              { label: 'Processing Time', value: '2–3 business days' },
              { label: 'Domestic Delivery', value: '5–10 business days' },
              { label: 'International Delivery', value: '15–25 business days' },
              { label: 'Free Shipping Above', value: 'Rs. 50,000' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '18px 20px' }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: 'var(--iv)', fontWeight: 400, letterSpacing: '.05em' }}>{value}</div>
              </div>
            ))}
          </div>

          {[
            { title: '1. Packaging', body: 'Each artefact is individually wrapped in acid-free tissue, cushioned with eco-friendly packing material, and placed in a branded outer box. Fragile items like bronzes and paintings receive additional rigid support. We take extraordinary care to ensure your piece arrives safely.' },
            { title: '2. Domestic Shipping', body: 'We ship across all states in India via trusted courier partners including Delhivery, Blue Dart, and Shiprocket. Standard delivery takes 5–10 business days from dispatch. Remote areas may take longer. A tracking number will be shared via WhatsApp once your order is dispatched.' },
            { title: '3. International Shipping', body: 'We ship to UAE, USA, UK, Canada, Australia, Singapore, and other countries on request. International orders may be subject to customs duties and import taxes levied by the destination country. These are borne entirely by the buyer. Delivery typically takes 15–25 business days.' },
            { title: '4. Shipping Charges', body: 'Domestic shipping is Rs. 500 for orders below Rs. 50,000. Orders above Rs. 50,000 qualify for free shipping within India. International shipping charges are calculated at checkout based on weight and destination.' },
            { title: '5. Tracking', body: 'You will receive a WhatsApp message with tracking details once your order is dispatched. You can track your shipment directly on the courier partner\'s website using the provided tracking number.' },
            { title: '6. Delays', body: 'Tamarind Taless is not responsible for delays caused by courier partners, natural events, strikes, or customs clearance. We will assist you in following up with the courier if your shipment is delayed beyond the estimated delivery date.' },
            { title: '7. Lost or Stolen Shipments', body: 'If your tracking shows delivery but you have not received the item, please contact us within 24 hours. We will initiate an investigation with the courier. Tamarind Taless is not liable for shipments stolen after confirmed delivery.' },
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

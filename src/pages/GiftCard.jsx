import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { useCart } from '../context/CartContext';
import PageHero from '../components/PageHero';
import { fmt } from '../data/products';
import toast from 'react-hot-toast';

const PRESETS = [1000, 2500, 5000, 10000];

function makeGiftCode() {
  return 'TT-GC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function GiftCard() {
  const { brand } = useBrand();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(2500);
  const [custom, setCustom] = useState('');
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  const min = brand.giftcard_min || 500;
  const max = brand.giftcard_max || 50000;
  const activeAmount = custom ? Number(custom) : amount;
  const valid = activeAmount >= min && activeAmount <= max;

  function selectPreset(v) {
    setAmount(v);
    setCustom('');
  }

  function handleAddToCart() {
    if (!valid) {
      toast.error(`Please enter an amount between ${fmt(min)} and ${fmt(max)}.`);
      return;
    }
    if (forSomeoneElse && (!recipientName.trim() || !recipientEmail.trim())) {
      toast.error("Please enter the recipient's name and email.");
      return;
    }
    const giftCode = makeGiftCode();
    addToCart({
      id: 'giftcard-' + Date.now(),
      name: `Gift Card (${fmt(activeAmount)})`,
      cat: 'Gift Card',
      price: activeAmount,
      stock: 999,
      images: [],
      bg: 'linear-gradient(145deg,#2C1013,#4A1519 55%,#211D14)',
      isGiftCard: true,
      giftCode,
      recipientName: forSomeoneElse ? recipientName.trim() : '',
      recipientEmail: forSomeoneElse ? recipientEmail.trim() : '',
      giftMessage: message.trim(),
    });
    toast.success(`Gift card code ${giftCode} added to cart.`);
    navigate('/cart');
  }

  if (brand.giftcard_enabled === false) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <PageHero eyebrow="Tamarind Taless" title="Gift Cards" />
        <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Gift cards aren't available right now — check back soon.
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHero
        image={brand.hero_giftcard}
        position={brand.hero_giftcard_position}
        eyebrow="Give the Gift of Choice"
        title="Gift Cards"
        subtitle="Let them choose their own piece of India's heritage."
      />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: 'var(--iv)', lineHeight: 1.8, textAlign: 'center', marginBottom: 40, fontStyle: 'italic' }}>
            {brand.giftcard_description}
          </p>

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '32px 28px' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 16 }}>Choose an Amount</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {PRESETS.map(v => (
                <button
                  key={v}
                  onClick={() => selectPreset(v)}
                  style={{
                    padding: '14px 8px',
                    fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13,
                    border: `1px solid ${!custom && amount === v ? 'var(--gd)' : 'var(--line)'}`,
                    background: !custom && amount === v ? 'var(--gd)' : 'transparent',
                    color: !custom && amount === v ? 'var(--text-dark)' : 'var(--iv)',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >{fmt(v)}</button>
              ))}
            </div>

            <label style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.6)', display: 'block', marginBottom: 8 }}>
              Or Enter a Custom Amount
            </label>
            <input
              type="number"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onWheel={e => e.currentTarget.blur()}
              placeholder={`Between ${fmt(min)} and ${fmt(max)}`}
              style={{ width: '100%', padding: '13px 14px', border: '1px solid var(--line)', background: 'var(--bg)', fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: 'var(--iv)', outline: 'none', marginBottom: 24 }}
            />

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 14 }}>Who's This For?</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: forSomeoneElse ? 18 : 0 }}>
                {[[false, 'For Myself'], [true, 'A Gift for Someone Else']].map(([val, label]) => (
                  <button
                    key={label}
                    onClick={() => setForSomeoneElse(val)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12,
                      border: `1px solid ${forSomeoneElse === val ? 'var(--gd)' : 'var(--line)'}`,
                      background: forSomeoneElse === val ? 'var(--gd)' : 'transparent',
                      color: forSomeoneElse === val ? 'var(--text-dark)' : 'var(--iv)',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >{label}</button>
                ))}
              </div>

              {forSomeoneElse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.6)', display: 'block', marginBottom: 6 }}>Recipient's Name</label>
                    <input value={recipientName} onChange={e => setRecipientName(e.target.value)} style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--line)', background: 'var(--bg)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.6)', display: 'block', marginBottom: 6 }}>Recipient's Email</label>
                    <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--line)', background: 'var(--bg)', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: 'var(--iv)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(106,99,80,.6)', display: 'block', marginBottom: 6 }}>Personal Message (optional)</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--line)', background: 'var(--bg)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--iv)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13.5, fontStyle: 'italic', color: 'rgba(106,99,80,.75)' }}>
                    We'll pass the gift card code and your message on to {recipientName || 'the recipient'} on our team's behalf once your order is placed.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--iv)' }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: 'var(--crimson)', fontWeight: 500 }}>{fmt(activeAmount || 0)}</span>
            </div>

            <button className="btn btn-dark btn-full" onClick={handleAddToCart}>Add Gift Card to Cart</button>
          </div>
        </div>
      </section>
    </div>
  );
}

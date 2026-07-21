import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { useCart } from '../context/CartContext';
import PageHero from '../components/PageHero';
import { fmt } from '../data/products';
import toast from 'react-hot-toast';

const PRESETS = [1000, 2500, 5000, 10000];

export default function GiftCard() {
  const { brand } = useBrand();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(2500);
  const [custom, setCustom] = useState('');

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
    addToCart({
      id: 'giftcard-' + Date.now(),
      name: `Gift Card (${fmt(activeAmount)})`,
      cat: 'Gift Card',
      price: activeAmount,
      stock: 999,
      images: [],
      bg: 'linear-gradient(145deg,#2C1013,#4A1519 55%,#211D14)',
      isGiftCard: true,
    });
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

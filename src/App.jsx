import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { About, Contact } from './pages/AboutContact';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Services from './pages/Services';
import Stories from './pages/Stories';
import Care from './pages/Care';
import './styles/globals.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function CursorAndProgress() {
  const curRef = useRef(null);
  const progressRef = useRef(null);
  useEffect(() => {
    const cur = curRef.current;
    const prog = progressRef.current;
    let visible = false;
    function onMove(e) {
      if (!visible) { if (cur) cur.style.opacity = '1'; visible = true; }
      if (cur) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
    }
    function onOver(e) { if (e.target.closest('button,a,[role="button"],input,select,textarea,.pc')) cur?.classList.add('hov'); }
    function onOut(e) { if (e.target.closest('button,a,[role="button"],input,select,textarea,.pc')) cur?.classList.remove('hov'); }
    function onScroll() {
      if (!prog) return;
      const doc = document.documentElement;
      const pct = doc.scrollHeight === doc.clientHeight ? 0 : (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      prog.style.width = Math.min(pct, 100) + '%';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    window.addEventListener('scroll', onScroll);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <>
      <div id="tt-cursor" className="tt-cursor" ref={curRef} style={{ opacity: 0 }}></div>
      <div className="tt-progress" ref={progressRef}></div>
    </>
  );
}

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  return (
    <>
      {!isAdminPage && <Navbar />}
      <main>{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}

function NotFound() {
  return (
    <div style={{ paddingTop: 64, minHeight: '80vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(80px,14vw,140px)', fontWeight: 300, color: 'var(--iv)', lineHeight: 1, opacity: .15 }}>404</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.3em', color: 'var(--gd)', marginBottom: 18, textTransform: 'uppercase' }}>Page Not Found</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--iv)', marginBottom: 28, fontStyle: 'italic' }}>The page you are looking for does not exist.</p>
        <a href="/" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex' }}>Return Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BrandProvider>
          <CartProvider>
            <CursorAndProgress />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  background: '#1C0C14',
                  color: '#F8ECD8',
                  borderLeft: '3px solid #D4A040',
                  borderRadius: 0,
                  padding: '13px 22px',
                },
                success: { iconTheme: { primary: '#D4A040', secondary: '#1C0C14' } },
                error: { style: { borderLeft: '3px solid #B02840' } },
              }}
            />
            <ScrollToTop />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/care" element={<Care />} />
                <Route path="/blog" element={<Stories />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </CartProvider>
        </BrandProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

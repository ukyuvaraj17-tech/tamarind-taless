import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const BrandContext = createContext();
export function useBrand() { return useContext(BrandContext); }

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState({
    logo_url: '',
    brand_name: 'Tamarind Taless',
    tagline: 'Heritage Curators',
    // Per-page hero images
    hero_image: '',          // Home
    hero_shop: '',           // Shop
    hero_about: '',          // About
    hero_services: '',       // Services
    hero_stories: '',        // Stories/Blog
    hero_care: '',           // Care
    about_image: '',         // About page side image
    // Home showcase control
    featured_count: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrand() {
      try {
        const { data } = await supabase.from('settings').select('*').eq('id', 'brand').single();
        if (data) setBrand(b => ({ ...b, ...data }));
      } catch (e) { /* use defaults */ }
      finally { setLoading(false); }
    }
    fetchBrand();
  }, []);

  async function updateBrand(updates) {
    const { error } = await supabase.from('settings').upsert({ id: 'brand', ...updates });
    if (error) throw error;
    setBrand(b => ({ ...b, ...updates }));
  }

  return (
    <BrandContext.Provider value={{ brand, updateBrand, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const BrandContext = createContext();
export function useBrand() { return useContext(BrandContext); }

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState({
    logo_url: '',
    brand_name: 'Tamarind Taless',
    tagline: '',
    // Per-page hero images
    hero_image: '',          // Home
    hero_shop: '',           // Shop
    hero_about: '',          // About
    hero_services: '',       // Services
    hero_stories: '',        // Stories
    hero_care: '',           // Care
    hero_gallery: '',        // Gallery
    about_image: '',         // About page side image
    // Focal point (crop position) for each image above
    hero_image_position: '50% 50%',
    hero_shop_position: '50% 50%',
    hero_about_position: '50% 50%',
    hero_services_position: '50% 50%',
    hero_stories_position: '50% 50%',
    hero_care_position: '50% 50%',
    hero_gallery_position: '50% 50%',
    about_image_position: '50% 50%',
    // Splash / loading screen logo (shown while the site loads)
    splash_logo: '',
    // Registered office address shown in the footer
    registered_office: '',
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

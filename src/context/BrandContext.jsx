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
    hero_giftcard: '',       // Gift Card
    about_image: '',         // About page side image
    // Focal point (crop position) for each image above
    hero_image_position: '50% 50%',
    hero_shop_position: '50% 50%',
    hero_about_position: '50% 50%',
    hero_services_position: '50% 50%',
    hero_stories_position: '50% 50%',
    hero_care_position: '50% 50%',
    hero_gallery_position: '50% 50%',
    hero_giftcard_position: '50% 50%',
    about_image_position: '50% 50%',
    // Splash / loading screen logo (shown while the site loads)
    splash_logo: '',
    // Gallery page video (replaces the old collection-tiles grid)
    gallery_video: '',
    // Registered office address shown in the footer
    registered_office: '',
    // Home showcase control
    featured_count: 3,
    // Home page editable section text
    home_featured_label: 'Featured Acquisitions',
    home_featured_title: 'Pieces of Distinction',
    home_quote_text: 'Every piece that finds its way to Tamarind Taless has already lived a story. We simply help it begin another.',
    home_ink_eyebrow: 'Why We Curate',
    home_ink_title: 'Because beautiful traditions deserve to live on.',
    home_ink_body: 'Across India, remarkable craftsmanship continues to thrive, often in places few people ever see. Alongside these living traditions are vintage treasures that carry the memories of another time. Tamarind Taless exists to bring both together in one thoughtful collection.',
    home_ig_followers: '30,000',
    // Category taxonomy (masters/groups shown in the nav mega-menu and Shop filter).
    // null = use the built-in default in data/products.js until an admin customizes it.
    category_taxonomy: null,
    // Gift card page settings
    giftcard_enabled: true,
    giftcard_min: 500,
    giftcard_max: 50000,
    giftcard_description: "A Tamarind Taless gift card lets someone choose their own piece of India's heritage. Pick an amount, and we'll take care of the rest.",
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

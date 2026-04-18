// Run: node seed-products.js
// Seeds all 37 mock products into the database

require('dotenv').config()
const { db, dbFind, dbFindOne, dbInsert, dbCount, getNextId, initDB } = require('./db/database')

const mockProducts = [
  { id: 1, title: 'Premium Logo Bundle', slug: 'premium-logo-bundle', description: 'Professional logo templates for modern brands with 50+ variations', price: 2499, sale_price: null, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', category_ids: [1], tags: ['logo', 'branding', 'bundle'], featured: true, downloads: 1250, rating: 4.8, review_count: 234 },
  { id: 2, title: 'Minimalist Logo Pack', slug: 'minimalist-logo-pack', description: 'Clean and modern minimalist logo designs', price: 1499, sale_price: null, image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400', category_ids: [1], tags: ['logo', 'minimalist', 'modern'], featured: true, downloads: 2100, rating: 4.9, review_count: 456 },
  { id: 3, title: 'Vintage Badge Collection', slug: 'vintage-badge-collection', description: 'Retro-style badges and emblems for authentic branding', price: 1799, sale_price: 2999, image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400', category_ids: [1], tags: ['vintage', 'badge', 'retro'], featured: false, downloads: 890, rating: 4.7, review_count: 189 },
  { id: 4, title: 'Hand-Drawn Illustration Bundle', slug: 'hand-drawn-illustration-bundle', description: 'Beautiful hand-drawn illustrations for creative projects', price: 2999, sale_price: 5999, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', category_ids: [1], tags: ['illustration', 'hand-drawn', 'creative'], featured: true, downloads: 3200, rating: 4.9, review_count: 567 },
  { id: 5, title: 'Abstract Shape Library', slug: 'abstract-shape-library', description: '500+ abstract shapes and geometric elements', price: 1299, sale_price: null, image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400', category_ids: [1], tags: ['abstract', 'shapes', 'geometric'], featured: false, downloads: 1560, rating: 4.6, review_count: 312 },
  { id: 6, title: 'Character Design Kit', slug: 'character-design-kit', description: 'Customizable character illustrations with multiple poses', price: 3499, sale_price: null, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', category_ids: [1], tags: ['character', 'illustration', 'people'], featured: true, downloads: 1890, rating: 4.8, review_count: 423 },
  { id: 7, title: '3D Icon Mega Pack', slug: '3d-icon-mega-pack', description: '1000+ stunning 3D icons for modern interfaces', price: 3999, sale_price: 7999, image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', category_ids: [1], tags: ['3d', 'icons', 'ui'], featured: true, downloads: 5600, rating: 4.9, review_count: 1234 },
  { id: 8, title: 'Line Icon System', slug: 'line-icon-system', description: '2000+ vector line icons in multiple styles', price: 1999, sale_price: null, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', category_ids: [1], tags: ['icons', 'line', 'vector'], featured: true, downloads: 4200, rating: 4.8, review_count: 892 },
  { id: 9, title: 'Animated Icon Pack', slug: 'animated-icon-pack', description: 'Smooth animated icons for web and mobile apps', price: 2499, sale_price: null, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', category_ids: [1], tags: ['animated', 'icons', 'motion'], featured: false, downloads: 1670, rating: 4.7, review_count: 345 },
  { id: 10, title: 'Elegant Serif Font Family', slug: 'elegant-serif-font-family', description: 'Sophisticated serif typeface with 8 weights', price: 2999, sale_price: null, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', category_ids: [2], tags: ['serif', 'elegant', 'font'], featured: true, downloads: 2890, rating: 4.9, review_count: 678 },
  { id: 11, title: 'Vintage Serif Collection', slug: 'vintage-serif-collection', description: 'Classic vintage serif fonts for retro designs', price: 1799, sale_price: 2999, image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', category_ids: [2], tags: ['vintage', 'serif', 'retro'], featured: false, downloads: 1450, rating: 4.7, review_count: 234 },
  { id: 12, title: 'Modern Sans Font Bundle', slug: 'modern-sans-font-bundle', description: 'Contemporary sans serif fonts for digital projects', price: 2499, sale_price: null, image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', category_ids: [2], tags: ['sans-serif', 'modern', 'font'], featured: true, downloads: 2340, rating: 4.8, review_count: 512 },
  { id: 13, title: 'Geometric Sans Family', slug: 'geometric-sans-family', description: 'Clean geometric sans serif with multiple weights', price: 1999, sale_price: null, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', category_ids: [2], tags: ['geometric', 'sans-serif', 'clean'], featured: true, downloads: 1890, rating: 4.9, review_count: 423 },
  { id: 14, title: 'Signature Script Font', slug: 'signature-script-font', description: 'Elegant handwritten script for luxury branding', price: 1499, sale_price: null, image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400', category_ids: [2], tags: ['script', 'handwritten', 'signature'], featured: false, downloads: 1670, rating: 4.8, review_count: 345 },
  { id: 15, title: 'Brush Lettering Pack', slug: 'brush-lettering-pack', description: 'Authentic brush lettering fonts with natural flow', price: 1799, sale_price: 2999, image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400', category_ids: [2], tags: ['brush', 'lettering', 'handwritten'], featured: false, downloads: 980, rating: 4.7, review_count: 267 },
  { id: 16, title: 'Landing Page Template Kit', slug: 'landing-page-template-kit', description: '20 responsive landing page templates', price: 4999, sale_price: 9999, image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400', category_ids: [3], tags: ['landing', 'web', 'template'], featured: true, downloads: 3450, rating: 4.9, review_count: 789 },
  { id: 17, title: 'Dashboard UI Kit Pro', slug: 'dashboard-ui-kit-pro', description: 'Complete admin dashboard with 100+ components', price: 6999, sale_price: null, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', category_ids: [3, 5], tags: ['dashboard', 'admin', 'ui-kit'], featured: true, downloads: 2100, rating: 4.8, review_count: 567 },
  { id: 18, title: 'E-commerce Template Bundle', slug: 'ecommerce-template-bundle', description: 'Full e-commerce website templates with cart & checkout', price: 7999, sale_price: 14999, image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400', category_ids: [3], tags: ['ecommerce', 'shop', 'template'], featured: true, downloads: 4200, rating: 4.9, review_count: 892 },
  { id: 19, title: 'Instagram Story Templates', slug: 'instagram-story-templates', description: '100+ Instagram story templates for businesses', price: 1299, sale_price: null, image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', category_ids: [3], tags: ['instagram', 'social', 'stories'], featured: true, downloads: 5600, rating: 4.7, review_count: 1234 },
  { id: 20, title: 'Social Media Mega Pack', slug: 'social-media-mega-pack', description: 'Complete social media templates for all platforms', price: 2499, sale_price: 4999, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', category_ids: [3], tags: ['social', 'marketing', 'bundle'], featured: true, downloads: 3890, rating: 4.8, review_count: 678 },
  { id: 21, title: 'Business Card Templates', slug: 'business-card-templates', description: '50 professional business card designs', price: 999, sale_price: null, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400', category_ids: [3], tags: ['business-card', 'print', 'corporate'], featured: false, downloads: 1670, rating: 4.6, review_count: 345 },
  { id: 22, title: 'Flyer & Poster Bundle', slug: 'flyer-poster-bundle', description: 'Marketing flyers and posters for events', price: 1799, sale_price: null, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', category_ids: [3], tags: ['flyer', 'poster', 'marketing'], featured: false, downloads: 1450, rating: 4.7, review_count: 234 },
  { id: 23, title: '3D Mockup Collection', slug: '3d-mockup-collection', description: 'Professional 3D mockups for product presentation', price: 3499, sale_price: 6999, image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400', category_ids: [4], tags: ['3d', 'mockup', 'presentation'], featured: true, downloads: 2340, rating: 4.9, review_count: 512 },
  { id: 24, title: 'Device Mockup Bundle', slug: 'device-mockup-bundle', description: 'iPhone, MacBook, iPad mockups in various angles', price: 2999, sale_price: null, image: 'https://images.unsplash.com/photo-1592286927505-b0c2e0a13e60?w=400', category_ids: [4], tags: ['device', 'mockup', 'apple'], featured: true, downloads: 1890, rating: 4.8, review_count: 423 },
  { id: 25, title: '3D Character Pack', slug: '3d-character-pack', description: 'Rigged 3D characters for animation projects', price: 4999, sale_price: null, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', category_ids: [4], tags: ['3d', 'character', 'animation'], featured: false, downloads: 980, rating: 4.7, review_count: 267 },
  { id: 26, title: 'Gradient Background Pack', slug: 'gradient-background-pack', description: '500+ premium gradient backgrounds', price: 999, sale_price: 1999, image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400', category_ids: [1], tags: ['gradient', 'background', 'colors'], featured: true, downloads: 4200, rating: 4.8, review_count: 892 },
  { id: 27, title: 'Pattern Library Pro', slug: 'pattern-library-pro', description: 'Seamless patterns for web and print design', price: 1499, sale_price: null, image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', category_ids: [1], tags: ['pattern', 'seamless', 'texture'], featured: false, downloads: 1670, rating: 4.7, review_count: 345 },
  { id: 28, title: 'Infographic Elements', slug: 'infographic-elements', description: 'Charts, graphs, and infographic components', price: 1799, sale_price: null, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', category_ids: [1], tags: ['infographic', 'charts', 'data'], featured: true, downloads: 2890, rating: 4.9, review_count: 567 },
  { id: 29, title: 'Email Template Collection', slug: 'email-template-collection', description: 'Responsive email templates for marketing campaigns', price: 1999, sale_price: null, image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', category_ids: [3], tags: ['email', 'marketing', 'newsletter'], featured: false, downloads: 1890, rating: 4.8, review_count: 423 },
  { id: 30, title: 'Presentation Template Bundle', slug: 'presentation-template-bundle', description: 'PowerPoint & Keynote presentation templates', price: 2499, sale_price: 4999, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', category_ids: [3], tags: ['presentation', 'powerpoint', 'keynote'], featured: true, downloads: 3200, rating: 4.9, review_count: 678 },
  { id: 31, title: 'Texture Pack Pro', slug: 'texture-pack-pro', description: 'High-resolution textures for 3D and design', price: 2799, sale_price: null, image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', category_ids: [4], tags: ['texture', '3d', 'materials'], featured: false, downloads: 1450, rating: 4.6, review_count: 234 },
  { id: 32, title: 'Watercolor Graphics Bundle', slug: 'watercolor-graphics-bundle', description: 'Beautiful watercolor illustrations and elements', price: 1999, sale_price: null, image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400', category_ids: [1], tags: ['watercolor', 'illustration', 'artistic'], featured: false, downloads: 2100, rating: 4.8, review_count: 456 },
  { id: 33, title: 'Mobile App UI Kit', slug: 'mobile-app-ui-kit', description: 'Complete mobile app design system', price: 3999, sale_price: 7999, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', category_ids: [3, 5], tags: ['mobile', 'app', 'ui-kit'], featured: true, downloads: 3450, rating: 4.9, review_count: 789 },
  { id: 34, title: 'Calligraphy Font Collection', slug: 'calligraphy-font-collection', description: 'Elegant calligraphy fonts for wedding invitations', price: 1699, sale_price: null, image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400', category_ids: [2], tags: ['calligraphy', 'wedding', 'elegant'], featured: false, downloads: 1560, rating: 4.7, review_count: 312 },
  { id: 35, title: 'Isometric Illustration Pack', slug: 'isometric-illustration-pack', description: 'Modern isometric illustrations for tech projects', price: 2999, sale_price: null, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', category_ids: [1], tags: ['isometric', 'illustration', 'tech'], featured: true, downloads: 2890, rating: 4.8, review_count: 567 },
  { id: 36, title: 'Sticker Pack Bundle', slug: 'sticker-pack-bundle', description: 'Fun stickers for messaging apps and social media', price: 799, sale_price: null, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', category_ids: [1], tags: ['sticker', 'emoji', 'fun'], featured: false, downloads: 1450, rating: 4.6, review_count: 234 },
  { id: 37, title: 'eCut Plugin for CorelDRAW', slug: 'ecut-plugin', description: 'The most powerful CorelDRAW plugin. 50+ pro tools — smart cut lines, nesting, color separation, batch processing and more.', price: 2999, sale_price: 5999, image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800', category_ids: [6], tags: ['coreldraw', 'plugin', 'tools', 'automation'], featured: true, downloads: 12000, rating: 4.9, review_count: 1247 },
]

async function seed() {
  await initDB()
  let seeded = 0
  for (const p of mockProducts) {
    const existing = await dbFindOne(db.products, { slug: p.slug })
    if (!existing) {
      await dbInsert(db.products, {
        ...p,
        short_description: '',
        images: [],
        file_format: '',
        file_size: '',
        compatibility: '',
        version: '1.0.0',
        license: 'Personal Use',
        show_on_main: true,
        status: 'published',
        seo_title: '',
        seo_desc: '',
        satellite_page: null,
        created_at: new Date(),
        updated_at: new Date()
      })
      seeded++
    }
  }
  console.log(`✅ Seeded ${seeded} products (${mockProducts.length - seeded} already existed)`)
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })

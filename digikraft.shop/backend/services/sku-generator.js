// ===== SKU GENERATOR =====
// Generates intelligent product codes: DK-[CAT]-[TYPE]-[YY]-[SEQ]
// Example: DK-GFX-LOGO-25-001, DK-FNT-SANS-25-014, DK-PLG-CDR-25-001

// Category codes
const CATEGORY_CODES = {
  'graphics':    'GFX',
  'fonts':       'FNT',
  'templates':   'TPL',
  'ui kits':     'UIK',
  'ui-kits':     'UIK',
  'plugins':     'PLG',
  '3d assets':   '3DA',
  '3d-assets':   '3DA',
  'mockups':     'MCK',
  'icons':       'ICN',
  'patterns':    'PAT',
  'courses':     'CRS',
  'tools':       'TLS',
  'bundles':     'BDL',
}

// Type codes — detected from title + tags
const TYPE_RULES = [
  // Graphics
  { keywords: ['logo', 'brand', 'identity', 'branding'],          code: 'LOGO' },
  { keywords: ['illustration', 'illustrat', 'drawing', 'artwork'], code: 'ILLU' },
  { keywords: ['icon', 'icons', 'pictogram'],                      code: 'ICON' },
  { keywords: ['vector', 'svg', 'eps', 'clipart'],                 code: 'VCTR' },
  { keywords: ['mockup', 'mock-up', 'presentation'],               code: 'MOCK' },
  { keywords: ['pattern', 'seamless', 'texture', 'background'],    code: 'PATN' },
  { keywords: ['infographic', 'chart', 'graph', 'data'],           code: 'INFO' },
  { keywords: ['watercolor', 'hand-drawn', 'handdrawn'],           code: 'HAND' },
  { keywords: ['3d', 'three-d', 'render', 'model'],                code: '3DAS' },
  { keywords: ['badge', 'stamp', 'label', 'sticker'],              code: 'BADG' },
  // Fonts
  { keywords: ['serif'],                                            code: 'SERF' },
  { keywords: ['sans', 'sans-serif'],                              code: 'SANS' },
  { keywords: ['script', 'handwritten', 'calligraphy', 'cursive'], code: 'SCPT' },
  { keywords: ['display', 'decorative', 'headline'],               code: 'DISP' },
  { keywords: ['monospace', 'mono', 'code'],                       code: 'MONO' },
  { keywords: ['brush', 'lettering'],                              code: 'BRSH' },
  // Templates
  { keywords: ['landing', 'landing page'],                         code: 'LAND' },
  { keywords: ['dashboard', 'admin', 'panel'],                     code: 'DASH' },
  { keywords: ['email', 'newsletter', 'mailer'],                   code: 'MAIL' },
  { keywords: ['social', 'instagram', 'facebook', 'story'],        code: 'SOCL' },
  { keywords: ['presentation', 'powerpoint', 'keynote', 'slides'], code: 'PRES' },
  { keywords: ['business card', 'visiting card'],                  code: 'BSCD' },
  { keywords: ['flyer', 'poster', 'banner'],                       code: 'FLYR' },
  { keywords: ['resume', 'cv', 'portfolio'],                       code: 'RESM' },
  { keywords: ['ecommerce', 'shop', 'store', 'product page'],      code: 'ECOM' },
  { keywords: ['web', 'website', 'html', 'css'],                   code: 'WEBT' },
  // Plugins
  { keywords: ['coreldraw', 'corel', 'cdr'],                       code: 'CORL' },
  { keywords: ['photoshop', 'psd', 'ps'],                          code: 'PHSH' },
  { keywords: ['illustrator', 'ai'],                               code: 'ILLS' },
  { keywords: ['figma'],                                            code: 'FIGM' },
  { keywords: ['wordpress', 'wp'],                                  code: 'WDPR' },
  { keywords: ['sketch'],                                           code: 'SKTC' },
  // Courses
  { keywords: ['course', 'tutorial', 'learn', 'training'],         code: 'CRSE' },
  { keywords: ['ebook', 'e-book', 'guide', 'handbook'],            code: 'EBKK' },
  // Default
  { keywords: ['bundle', 'pack', 'collection', 'mega'],            code: 'BNDL' },
  { keywords: ['kit', 'toolkit', 'system'],                        code: 'KITK' },
]

/**
 * Detect type code from product title + tags
 */
function detectTypeCode(title, tags = [], category = '') {
  const text = `${title} ${(tags || []).join(' ')} ${category}`.toLowerCase()
  
  for (const rule of TYPE_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.code
    }
  }
  
  // Fallback based on category
  const catLower = category.toLowerCase()
  if (catLower.includes('graphic')) return 'GRFX'
  if (catLower.includes('font')) return 'FONT'
  if (catLower.includes('template')) return 'TMPL'
  if (catLower.includes('plugin')) return 'PLUG'
  if (catLower.includes('3d')) return '3DAS'
  if (catLower.includes('icon')) return 'ICON'
  
  return 'DGTL' // generic digital
}

/**
 * Get category code from category name
 */
function getCategoryCode(categoryName = '') {
  const lower = categoryName.toLowerCase().trim()
  return CATEGORY_CODES[lower] || categoryName.substring(0, 3).toUpperCase() || 'DGT'
}

/**
 * Generate SKU for a product
 * @param {object} product - { title, tags, category, id }
 * @param {number} sequenceNum - sequential number for this category+type combo
 * @returns {string} SKU like DK-GFX-LOGO-25-001
 */
function generateSKU(product, sequenceNum) {
  const year = new Date().getFullYear().toString().slice(-2) // "25"
  const catCode = getCategoryCode(product.category || '')
  const typeCode = detectTypeCode(product.title || product.name || '', product.tags, product.category || '')
  const seq = String(sequenceNum).padStart(3, '0')
  
  return `DK-${catCode}-${typeCode}-${year}-${seq}`
}

/**
 * Generate SKU and ensure uniqueness against existing products
 * @param {object} product - product data
 * @param {Function} findExisting - async fn(sku) => boolean (true if exists)
 * @returns {string} unique SKU
 */
async function generateUniqueSKU(product, findExisting) {
  const year = new Date().getFullYear().toString().slice(-2)
  const catCode = getCategoryCode(product.category || '')
  const typeCode = detectTypeCode(product.title || product.name || '', product.tags, product.category || '')
  
  // Try sequences 1-999 until unique
  for (let seq = 1; seq <= 999; seq++) {
    const sku = `DK-${catCode}-${typeCode}-${year}-${String(seq).padStart(3, '0')}`
    const exists = await findExisting(sku)
    if (!exists) return sku
  }
  
  // Fallback with timestamp
  return `DK-${catCode}-${typeCode}-${year}-${Date.now().toString().slice(-4)}`
}

module.exports = { generateSKU, generateUniqueSKU, getCategoryCode, detectTypeCode }

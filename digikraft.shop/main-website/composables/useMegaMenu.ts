export const useMegaMenu = () => {
  const menuCategories = [
    {
      name: 'Fonts',
      href: '/category/fonts',
      subcategories: [
        {
          id: 'display-fonts',
          name: 'Display Fonts',
          description: 'Eye-catching fonts perfect for headlines and titles',
          href: '/category/fonts/display',
          items: [
            {
              name: 'By Style',
              links: [
                { name: 'Bold Display', href: '/category/fonts/bold-display' },
                { name: 'Decorative', href: '/category/fonts/decorative' },
                { name: 'Retro & Vintage', href: '/category/fonts/retro' },
                { name: 'Modern Display', href: '/category/fonts/modern-display' }
              ]
            },
            {
              name: 'By Theme',
              links: [
                { name: 'Wedding Fonts', href: '/category/fonts/wedding' },
                { name: 'Halloween Fonts', href: '/category/fonts/halloween' },
                { name: 'Christmas Fonts', href: '/category/fonts/christmas' },
                { name: 'Birthday Fonts', href: '/category/fonts/birthday' }
              ]
            },
            {
              name: 'Popular',
              links: [
                { name: 'Bubble Letters', href: '/category/fonts/bubble' },
                { name: 'Graffiti Fonts', href: '/category/fonts/graffiti' },
                { name: 'Stencil Fonts', href: '/category/fonts/stencil' },
                { name: 'Neon Fonts', href: '/category/fonts/neon' }
              ]
            }
          ],
          featured: [
            {
              id: 'f1',
              name: 'Retro Groovy Font Bundle',
              image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
              price: '₹899',
              href: '/product/retro-groovy-bundle'
            },
            {
              id: 'f2',
              name: 'Modern Sans Serif Family',
              image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
              price: '₹1,299',
              href: '/product/modern-sans-family'
            },
            {
              id: 'f3',
              name: 'Elegant Script Collection',
              image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/elegant-script'
            },
            {
              id: 'f4',
              name: 'Handwritten Font Pack',
              image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop',
              price: '₹699',
              href: '/product/handwritten-pack'
            }
          ]
        },
        {
          id: 'script-fonts',
          name: 'Script & Handwritten',
          description: 'Beautiful flowing scripts and authentic handwritten styles',
          href: '/category/fonts/script',
          items: [
            {
              name: 'Script Styles',
              links: [
                { name: 'Calligraphy', href: '/category/fonts/calligraphy' },
                { name: 'Brush Script', href: '/category/fonts/brush-script' },
                { name: 'Signature Fonts', href: '/category/fonts/signature' },
                { name: 'Cursive Fonts', href: '/category/fonts/cursive' }
              ]
            },
            {
              name: 'Handwritten',
              links: [
                { name: 'Marker Fonts', href: '/category/fonts/marker' },
                { name: 'Chalk Fonts', href: '/category/fonts/chalk' },
                { name: 'Pencil Fonts', href: '/category/fonts/pencil' },
                { name: 'Crayon Fonts', href: '/category/fonts/crayon' }
              ]
            },
            {
              name: 'Special Occasions',
              links: [
                { name: 'Wedding Scripts', href: '/category/fonts/wedding-script' },
                { name: 'Monogram Fonts', href: '/category/fonts/monogram' },
                { name: 'Invitation Fonts', href: '/category/fonts/invitation' },
                { name: 'Love Letter Fonts', href: '/category/fonts/love-letter' }
              ]
            }
          ],
          featured: [
            {
              id: 'f5',
              name: 'Luxury Calligraphy Bundle',
              image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
              price: '₹1,499',
              href: '/product/luxury-calligraphy'
            },
            {
              id: 'f6',
              name: 'Brush Lettering Kit',
              image: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop',
              price: '₹999',
              href: '/product/brush-lettering'
            },
            {
              id: 'f7',
              name: 'Signature Font Collection',
              image: 'https://images.unsplash.com/photo-1471666875520-c75081f42081?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/signature-collection'
            },
            {
              id: 'f8',
              name: 'Handwritten Notes Pack',
              image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
              price: '₹599',
              href: '/product/handwritten-notes'
            }
          ]
        },
        {
          id: 'serif-fonts',
          name: 'Serif Fonts',
          description: 'Classic and elegant serif typefaces for timeless designs',
          href: '/category/fonts/serif',
          items: [
            {
              name: 'Classic Serif',
              links: [
                { name: 'Old Style Serif', href: '/category/fonts/old-style' },
                { name: 'Transitional Serif', href: '/category/fonts/transitional' },
                { name: 'Didone Serif', href: '/category/fonts/didone' },
                { name: 'Slab Serif', href: '/category/fonts/slab' }
              ]
            },
            {
              name: 'Modern Serif',
              links: [
                { name: 'Contemporary Serif', href: '/category/fonts/contemporary' },
                { name: 'Geometric Serif', href: '/category/fonts/geometric-serif' },
                { name: 'Humanist Serif', href: '/category/fonts/humanist-serif' },
                { name: 'Display Serif', href: '/category/fonts/display-serif' }
              ]
            },
            {
              name: 'Use Cases',
              links: [
                { name: 'Editorial Fonts', href: '/category/fonts/editorial' },
                { name: 'Book Fonts', href: '/category/fonts/book' },
                { name: 'Magazine Fonts', href: '/category/fonts/magazine' },
                { name: 'Luxury Branding', href: '/category/fonts/luxury' }
              ]
            }
          ],
          featured: []
        }
      ]
    },
    {
      name: 'Graphics',
      href: '/category/graphics',
      subcategories: [
        {
          id: 'svg-files',
          name: 'SVG Cut Files',
          description: 'Ready-to-cut SVG files for Cricut, Silhouette & more',
          href: '/category/graphics/svg',
          items: [
            {
              name: 'By Machine',
              links: [
                { name: 'Cricut SVG', href: '/category/graphics/cricut' },
                { name: 'Silhouette SVG', href: '/category/graphics/silhouette' },
                { name: 'Brother Scan N Cut', href: '/category/graphics/brother' },
                { name: 'Universal SVG', href: '/category/graphics/universal-svg' }
              ]
            },
            {
              name: 'By Theme',
              links: [
                { name: 'Quotes & Sayings', href: '/category/graphics/quotes' },
                { name: 'Monograms', href: '/category/graphics/monograms' },
                { name: 'Animals', href: '/category/graphics/animals' },
                { name: 'Floral SVG', href: '/category/graphics/floral' }
              ]
            },
            {
              name: 'Seasonal',
              links: [
                { name: 'Christmas SVG', href: '/category/graphics/christmas-svg' },
                { name: 'Halloween SVG', href: '/category/graphics/halloween-svg' },
                { name: 'Easter SVG', href: '/category/graphics/easter' },
                { name: 'Birthday SVG', href: '/category/graphics/birthday-svg' }
              ]
            }
          ],
          featured: [
            {
              id: 'g1',
              name: 'Mega SVG Bundle - 500+ Files',
              image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
              price: '₹1,999',
              href: '/product/mega-svg-bundle'
            },
            {
              id: 'g2',
              name: 'Christmas SVG Collection',
              image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/christmas-svg'
            },
            {
              id: 'g3',
              name: 'Monogram SVG Bundle',
              image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
              price: '₹599',
              href: '/product/monogram-svg'
            },
            {
              id: 'g4',
              name: 'Floral SVG Pack',
              image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
              price: '₹699',
              href: '/product/floral-svg'
            }
          ]
        },
        {
          id: 'clipart',
          name: 'Clipart & Illustrations',
          description: 'Beautiful clipart and illustrations for all projects',
          href: '/category/graphics/clipart',
          items: [
            {
              name: 'By Style',
              links: [
                { name: 'Watercolor Clipart', href: '/category/graphics/watercolor' },
                { name: 'Hand Drawn', href: '/category/graphics/hand-drawn' },
                { name: 'Flat Design', href: '/category/graphics/flat' },
                { name: 'Vintage Clipart', href: '/category/graphics/vintage-clipart' }
              ]
            },
            {
              name: 'By Theme',
              links: [
                { name: 'Floral Clipart', href: '/category/graphics/floral-clipart' },
                { name: 'Animal Clipart', href: '/category/graphics/animal-clipart' },
                { name: 'Food & Drink', href: '/category/graphics/food' },
                { name: 'Travel & Places', href: '/category/graphics/travel' }
              ]
            },
            {
              name: 'Seasonal',
              links: [
                { name: 'Spring Clipart', href: '/category/graphics/spring' },
                { name: 'Summer Clipart', href: '/category/graphics/summer' },
                { name: 'Fall Clipart', href: '/category/graphics/fall' },
                { name: 'Winter Clipart', href: '/category/graphics/winter' }
              ]
            }
          ],
          featured: [
            {
              id: 'g5',
              name: 'Watercolor Flower Bundle',
              image: 'https://images.unsplash.com/photo-1488554378835-f7acf46e6c98?w=400&h=300&fit=crop',
              price: '₹1,199',
              href: '/product/watercolor-flowers'
            },
            {
              id: 'g6',
              name: 'Cute Animal Clipart Pack',
              image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop',
              price: '₹899',
              href: '/product/cute-animals'
            },
            {
              id: 'g7',
              name: 'Vintage Botanical Set',
              image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/vintage-botanical'
            },
            {
              id: 'g8',
              name: 'Food Illustration Bundle',
              image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
              price: '₹699',
              href: '/product/food-illustrations'
            }
          ]
        },
        {
          id: 'sublimation',
          name: 'Sublimation Designs',
          description: 'Print-ready sublimation designs for mugs, t-shirts & more',
          href: '/category/graphics/sublimation',
          items: [
            {
              name: 'By Product',
              links: [
                { name: 'Mug Designs', href: '/category/graphics/mug-designs' },
                { name: 'T-Shirt Designs', href: '/category/graphics/tshirt-designs' },
                { name: 'Tumbler Wraps', href: '/category/graphics/tumbler' },
                { name: 'Ornament Designs', href: '/category/graphics/ornaments' }
              ]
            },
            {
              name: 'By Style',
              links: [
                { name: 'Funny Quotes', href: '/category/graphics/funny-quotes' },
                { name: 'Inspirational', href: '/category/graphics/inspirational' },
                { name: 'Floral Patterns', href: '/category/graphics/floral-patterns' },
                { name: 'Abstract Art', href: '/category/graphics/abstract-art' }
              ]
            },
            {
              name: 'Occasions',
              links: [
                { name: 'Birthday Designs', href: '/category/graphics/birthday-designs' },
                { name: 'Mother\'s Day', href: '/category/graphics/mothers-day' },
                { name: 'Father\'s Day', href: '/category/graphics/fathers-day' },
                { name: 'Valentine\'s Day', href: '/category/graphics/valentines' }
              ]
            }
          ],
          featured: [
            {
              id: 'g9',
              name: '100 Mug Design Bundle',
              image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop',
              price: '₹1,499',
              href: '/product/mug-bundle'
            },
            {
              id: 'g10',
              name: 'Tumbler Wrap Collection',
              image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
              price: '₹999',
              href: '/product/tumbler-wraps'
            },
            {
              id: 'g11',
              name: 'Funny Quote Designs',
              image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/funny-quotes'
            },
            {
              id: 'g12',
              name: 'Floral Sublimation Pack',
              image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop',
              price: '₹899',
              href: '/product/floral-sublimation'
            }
          ]
        }
      ]
    },
    {
      name: 'Crafts',
      href: '/category/crafts',
      subcategories: [
        {
          id: 'printables',
          name: 'Printables',
          description: 'Instant download printables for home and office',
          href: '/category/crafts/printables',
          items: [
            {
              name: 'Planners',
              links: [
                { name: 'Daily Planners', href: '/category/crafts/daily-planners' },
                { name: 'Weekly Planners', href: '/category/crafts/weekly-planners' },
                { name: 'Budget Planners', href: '/category/crafts/budget-planners' },
                { name: 'Meal Planners', href: '/category/crafts/meal-planners' }
              ]
            },
            {
              name: 'Wall Art',
              links: [
                { name: 'Motivational Prints', href: '/category/crafts/motivational' },
                { name: 'Nursery Prints', href: '/category/crafts/nursery' },
                { name: 'Abstract Art', href: '/category/crafts/abstract-prints' },
                { name: 'Typography Prints', href: '/category/crafts/typography' }
              ]
            },
            {
              name: 'Party Supplies',
              links: [
                { name: 'Birthday Banners', href: '/category/crafts/banners' },
                { name: 'Cupcake Toppers', href: '/category/crafts/toppers' },
                { name: 'Party Tags', href: '/category/crafts/tags' },
                { name: 'Invitations', href: '/category/crafts/invitations' }
              ]
            }
          ],
          featured: [
            {
              id: 'c1',
              name: 'Ultimate Planner Bundle',
              image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
              price: '₹1,299',
              href: '/product/planner-bundle'
            },
            {
              id: 'c2',
              name: 'Wall Art Collection',
              image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=300&fit=crop',
              price: '₹899',
              href: '/product/wall-art'
            },
            {
              id: 'c3',
              name: 'Party Printables Pack',
              image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
              price: '₹699',
              href: '/product/party-printables'
            },
            {
              id: 'c4',
              name: 'Nursery Decor Set',
              image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop',
              price: '₹799',
              href: '/product/nursery-decor'
            }
          ]
        }
      ]
    },
    {
      name: 'Templates',
      href: '/category/templates',
      subcategories: [
        {
          id: 'web',
          name: 'Web Templates',
          description: 'Complete website templates and UI kits',
          href: '/category/templates/web',
          items: [
            {
              name: 'By Type',
              links: [
                { name: 'Landing Pages', href: '/category/templates/landing' },
                { name: 'Admin Dashboards', href: '/category/templates/admin' },
                { name: 'E-commerce', href: '/category/templates/ecommerce' },
                { name: 'Portfolio', href: '/category/templates/portfolio' }
              ]
            },
            {
              name: 'By Framework',
              links: [
                { name: 'React Templates', href: '/category/templates/react' },
                { name: 'Vue Templates', href: '/category/templates/vue' },
                { name: 'HTML/CSS', href: '/category/templates/html' },
                { name: 'WordPress', href: '/category/templates/wordpress' }
              ]
            },
            {
              name: 'UI Kits',
              links: [
                { name: 'Component Libraries', href: '/category/templates/components' },
                { name: 'Design Systems', href: '/category/templates/design-systems' },
                { name: 'Wireframe Kits', href: '/category/templates/wireframes' },
                { name: 'Mobile UI Kits', href: '/category/templates/mobile-ui' }
              ]
            }
          ],
          featured: []
        }
      ]
    }
  ]

  return {
    menuCategories
  }
}

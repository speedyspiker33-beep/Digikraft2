import { products, cart } from '../lib/api.js';

export async function renderProductDetailPage(slugOrId) {
  return `
    <div class="bg-surface min-h-screen py-8">
      <div class="container-custom">
        <nav class="text-sm text-text-secondary mb-6">
          <a href="/" class="hover:text-primary">Home</a>
          <span class="mx-2">/</span>
          <a href="/products" class="hover:text-primary">Products</a>
          <span class="mx-2">/</span>
          <span class="text-text-primary" id="breadcrumb-name">Loading...</span>
        </nav>
        
        <div id="product-container">
          <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function loadProduct(container, slugOrId) {
  try {
    const result = slugOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ? await products.get(slugOrId)
      : await products.getBySlug(slugOrId);
    
    if (!result.success) {
      throw new Error(result.message || 'Product not found');
    }
    
    const product = result.data;
    document.getElementById('breadcrumb-name').textContent = product.title;
    document.title = `${product.title} - DigiKraft`;
    
    container.innerHTML = renderProductContent(product);
    
    loadRelatedProducts(product.id);
  } catch (error) {
    container.innerHTML = `
      <div class="bg-white rounded-xl p-8 text-center">
        <h2 class="text-2xl font-bold mb-4">Product Not Found</h2>
        <p class="text-text-secondary mb-6">${error.message}</p>
        <a href="/products" class="btn btn-primary">Browse Products</a>
      </div>
    `;
  }
}

function renderProductContent(product) {
  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  
  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div class="bg-white rounded-xl overflow-hidden mb-4">
          <div class="aspect-square flex items-center justify-center bg-gray-100">
            ${product.images?.[0] ? `
              <img src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover">
            ` : `
              <svg class="w-48 h-48 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            `}
          </div>
        </div>
        ${product.images?.length > 1 ? `
          <div class="grid grid-cols-4 gap-4">
            ${product.images.slice(0, 4).map((img, i) => `
              <div class="bg-white rounded-lg overflow-hidden cursor-pointer border-2 ${i === 0 ? 'border-primary' : 'border-transparent'} hover:border-primary">
                <div class="aspect-square flex items-center justify-center bg-gray-100">
                  <img src="${img}" alt="${product.title}" class="w-full h-full object-cover">
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      <div>
        ${product.categories?.[0] ? `<span class="text-primary font-semibold text-sm">${product.categories[0].name || 'Templates'}</span>` : ''}
        <h1 class="text-3xl font-bold text-text-primary mt-2 mb-4">${product.title}</h1>
        
        <div class="flex items-center gap-4 mb-6">
          <div class="flex text-warning">${'★'.repeat(5)}</div>
          <span class="text-text-secondary">(0 reviews)</span>
        </div>
        
        <div class="flex items-baseline gap-4 mb-6">
          <span class="text-4xl font-bold text-primary">$${price}</span>
          ${product.salePrice ? `
            <span class="text-xl text-text-muted line-through">$${product.price}</span>
            <span class="bg-danger text-white text-sm font-semibold px-2 py-1 rounded">${discount}% OFF</span>
          ` : ''}
        </div>
        
        <p class="text-text-secondary mb-6">${product.description || 'No description available.'}</p>
        
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center border border-border rounded-lg">
            <button class="px-4 py-3 hover:bg-surface" onclick="updateQuantity(-1)">-</button>
            <input type="number" value="1" min="1" class="w-16 text-center border-none focus:outline-none" id="quantity">
            <button class="px-4 py-3 hover:bg-surface" onclick="updateQuantity(1)">+</button>
          </div>
          <button class="btn btn-primary flex-1 text-lg py-3" onclick="addToCart('${product.id}', '${product.title.replace(/'/g, "\\'")}', ${price})">
            Add to Cart
          </button>
        </div>
        
        <div class="border-t border-border pt-6">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-text-muted">Format:</span>
              <span class="font-medium ml-2">Digital Download</span>
            </div>
            <div>
              <span class="text-text-muted">License:</span>
              <span class="font-medium ml-2">Commercial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-16">
      <div class="border-b border-border">
        <nav class="flex gap-8">
          <button class="pb-4 border-b-2 border-primary text-primary font-semibold">Description</button>
          <button class="pb-4 border-b-2 border-transparent text-text-secondary hover:text-primary">Reviews</button>
        </nav>
      </div>
      
      <div class="py-8">
        <h3 class="text-xl font-semibold mb-4">Product Description</h3>
        <div class="prose max-w-none text-text-secondary">
          <p>${product.description || 'No detailed description available.'}</p>
        </div>
      </div>
    </div>
    
    <section class="mt-16">
      <h2 class="text-2xl font-bold mb-8">You May Also Like</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6" id="related-products">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </section>
    
    <script>
      window.updateQuantity = function(delta) {
        const input = document.getElementById('quantity');
        const newVal = Math.max(1, parseInt(input.value || 1) + delta);
        input.value = newVal;
      };
      
      window.addToCart = function(id, title, price) {
        const qty = parseInt(document.getElementById('quantity').value || 1);
        if (window.cartStore) {
          window.cartStore.addItem({ id, title, price, quantity: qty });
          alert('Added to cart!');
        }
      };
    </script>
  `;
}

async function loadRelatedProducts(productId) {
  try {
    const result = await products.list({ limit: 4 });
    const container = document.getElementById('related-products');
    
    if (!result.success || !result.data.products.length) {
      container.innerHTML = '<p class="text-text-secondary">No related products found.</p>';
      return;
    }
    
    const related = result.data.products.filter(p => p.id !== productId).slice(0, 4);
    
    container.innerHTML = related.map(product => `
      <div class="card overflow-hidden cursor-pointer" onclick="window.location.href='/product/${product.slug || product.id}'">
        <div class="bg-surface h-40 flex items-center justify-center">
          ${product.images?.[0] ? `
            <img src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover">
          ` : `
            <svg class="w-16 h-16 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          `}
        </div>
        <div class="p-4">
          <h3 class="font-semibold mt-1 mb-2 line-clamp-1">${product.title}</h3>
          <span class="text-lg font-bold text-primary">$${product.salePrice || product.price}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('related-products').innerHTML = '<p class="text-text-secondary">Failed to load related products.</p>';
  }
}

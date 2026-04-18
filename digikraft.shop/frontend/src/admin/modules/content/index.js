/**
 * CONTENT MANAGEMENT MODULE
 * Blog posts, banners, SEO content
 */

const blog = {
  name: 'blog',
  label: 'Blog Posts',
  routes: [
    {
      path: '/',
      name: 'blog-posts',
      render: async () => {
        return `
          <div class="blog-posts-view">
            <h1>Blog Posts</h1>
            <div class="table-actions">
              <button class="btn btn-primary">
                <i class="fas fa-plus"></i> New Post
              </button>
              <button class="btn btn-secondary">
                <i class="fas fa-calendar"></i> Schedule
              </button>
            </div>
            <div class="card">
              <div class="empty-state">
                <i class="fas fa-blog"></i>
                <p>No blog posts yet</p>
                <button class="btn btn-primary">Create First Post</button>
              </div>
            </div>
          </div>
        `;
      }
    }
  ]
};

const banners = {
  name: 'banners',
  label: 'Promotional Banners',
  routes: [
    {
      path: '/banners',
      name: 'promotional-banners',
      render: async () => {
        return `
          <div class="banners-view">
            <h1>Promotional Banners</h1>
            <div class="banner-grid">
              <div class="banner-card">
                <h3>Homepage Hero Banner</h3>
                <div class="banner-preview">
                  <p>No banner set</p>
                  <button class="btn btn-secondary">Upload Image</button>
                </div>
              </div>
              <div class="banner-card">
                <h3>Announcement Bar</h3>
                <div class="banner-preview">
                  <textarea placeholder="Enter announcement text..."></textarea>
                  <button class="btn btn-primary">Save</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }
  ]
};

const seo = {
  name: 'seo',
  label: 'SEO Settings',
  routes: [
    {
      path: '/seo',
      name: 'seo-settings',
      render: async () => {
        return `
          <div class="seo-view">
            <h1>SEO Settings</h1>
            <div class="card">
              <h3>Meta Tags</h3>
              <div class="form-group">
                <label>Title</label>
                <input type="text" placeholder="DigiKraft - Digital Products" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea rows="3" placeholder="Default meta description..."></textarea>
              </div>
              <button class="btn btn-primary">Save SEO Settings</button>
            </div>
          </div>
        `;
      }
    }
  ]
};

export const routes = [
  ...blog.routes,
  ...banners.routes,
  ...seo.routes
];

export default {
  name: 'content',
  label: 'Content',
  icon: 'fa-blog',
  routes,
  init: async () => {
    console.log('📝 Content module initialized');
  }
};

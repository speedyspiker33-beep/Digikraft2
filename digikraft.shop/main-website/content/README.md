# DigiKraft.shop Content Management System (CMS)

This folder contains all CMS-managed content for the website using **Nuxt Content**.

## 📁 Folder Structure

```
content/
├── blog/              # Blog posts and articles
├── guides/            # Help guides and tutorials
├── pages/             # Static pages (About, Terms, Privacy)
└── config/            # Site configuration (sidebar, layout)
```

---

## 📝 Content Types

### 1. Blog Posts (`/blog`)

Create new blog posts as Markdown files:

**File naming**: `YYYY-MM-DD-slug.md`

**Example**: `content/blog/2024-01-15-design-trends.md`

```markdown
---
title: Your Blog Post Title
description: Short description for SEO and previews
author: Author Name
date: 2024-01-15
image: https://example.com/image.jpg
category: Design
tags: [design, trends, inspiration]
featured: true
---

# Your Content Here

Write your blog post content using Markdown...
```

**Frontmatter Fields**:
- `title` (required): Post title
- `description` (required): SEO description
- `author` (required): Author name
- `date` (required): Publication date (YYYY-MM-DD)
- `image` (required): Featured image URL
- `category` (required): Post category
- `tags` (required): Array of tags
- `featured` (optional): Show in featured section (true/false)

---

### 2. Guides (`/guides`)

Create help guides and tutorials:

**Example**: `content/guides/getting-started.md`

```markdown
---
title: Getting Started Guide
description: Learn how to use our platform
icon: rocket_launch
order: 1
category: basics
---

# Guide Content

Your guide content here...
```

**Frontmatter Fields**:
- `title` (required): Guide title
- `description` (required): Short description
- `icon` (optional): Material icon name
- `order` (required): Display order (1, 2, 3...)
- `category` (required): Guide category

---

### 3. Static Pages (`/pages`)

Create or edit static pages:

**Example**: `content/pages/about.md`

```markdown
---
title: About Us
description: Learn about our company
image: /images/about.jpg
layout: default
---

# About Content

Your page content...
```

**Frontmatter Fields**:
- `title` (required): Page title
- `description` (required): SEO description
- `image` (optional): Hero image
- `layout` (optional): Page layout (default, legal)
- `lastUpdated` (optional): Last update date

---

### 4. Configuration (`/config`)

#### Sidebar Configuration (`config/sidebar.yml`)

Control what appears in the right sidebar:

```yaml
sections:
  - id: hot-offers
    enabled: true
    title: Hot Offers
    icon: local_fire_department
    order: 1
    limit: 2
    
  - id: trending
    enabled: true
    title: Trending Now
    icon: trending_up
    order: 2
    limit: 3
    
  - id: blog-feed
    enabled: true
    title: Latest Articles
    icon: article
    order: 3
    limit: 2
    
  - id: newsletter
    enabled: true
    title: Stay Updated
    icon: mail
    order: 4

hotOffers:
  - productId: "premium-ui-kit"
    discount: 50
    
  - productId: "icon-set-collection"
    discount: 50

trending:
  - productId: "minimalist-logos"
  - productId: "social-media-pack"
  - productId: "vintage-fonts"
```

**How to customize**:
- Set `enabled: false` to hide a section
- Change `order` to reorder sections (1 = first, 4 = last)
- Adjust `limit` to show more/fewer items
- Update `productId` to feature different products

---

## 🎨 Markdown Features

### Headings
```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

### Text Formatting
```markdown
**bold text**
*italic text*
[link text](https://example.com)
```

### Lists
```markdown
- Bullet point 1
- Bullet point 2

1. Numbered item 1
2. Numbered item 2
```

### Images
```markdown
![Alt text](https://example.com/image.jpg)
```

### Code Blocks
````markdown
```javascript
const hello = 'world'
```
````

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

---

## 🚀 How to Add Content

### Add a New Blog Post

1. Create file: `content/blog/2024-02-21-my-post.md`
2. Add frontmatter (see template above)
3. Write content in Markdown
4. Save file
5. Post automatically appears at `/blog`

### Add a New Guide

1. Create file: `content/guides/my-guide.md`
2. Add frontmatter with `order` number
3. Write guide content
4. Save file
5. Guide appears at `/guides`

### Edit Static Pages

1. Open existing file: `content/pages/about.md`
2. Edit content
3. Save file
4. Changes appear immediately

### Customize Sidebar

1. Open: `content/config/sidebar.yml`
2. Edit section settings:
   - Toggle `enabled: true/false`
   - Change `order` numbers
   - Update `productId` references
3. Save file
4. Sidebar updates automatically

---

## 📍 URL Structure

Content files automatically create routes:

| File Path | URL |
|-----------|-----|
| `blog/2024-01-design-trends.md` | `/blog/2024-01-design-trends` |
| `guides/getting-started.md` | `/guides/getting-started` |
| `pages/about.md` | `/about` |

---

## 🔍 Querying Content (For Developers)

### Get Blog Posts
```typescript
const { getAllPosts } = useBlog()
const posts = await getAllPosts()
```

### Get Single Page
```typescript
const { getPage } = usePages()
const about = await getPage('about')
```

### Get Guides
```typescript
const { getAllGuides } = useGuides()
const guides = await getAllGuides()
```

### Get Sidebar Config
```typescript
const { getSections } = await useSidebarConfig()
const sections = getSections()
```

---

## 💡 Tips

1. **Images**: Use high-quality images (min 1200px wide)
2. **SEO**: Always fill in `title` and `description`
3. **Tags**: Use consistent tag names across posts
4. **Dates**: Use YYYY-MM-DD format
5. **Slugs**: Use lowercase with hyphens (my-blog-post)

---

## 🆘 Need Help?

- **Markdown Guide**: https://www.markdownguide.org/
- **Nuxt Content Docs**: https://content.nuxt.com/
- **Material Icons**: https://fonts.google.com/icons

---

## 📋 Quick Reference

### Blog Post Template
```markdown
---
title: Post Title
description: Post description
author: Your Name
date: 2024-02-21
image: https://example.com/image.jpg
category: Category Name
tags: [tag1, tag2, tag3]
featured: false
---

# Content starts here
```

### Guide Template
```markdown
---
title: Guide Title
description: Guide description
icon: help
order: 1
category: basics
---

# Guide content
```

### Page Template
```markdown
---
title: Page Title
description: Page description
layout: default
---

# Page content
```

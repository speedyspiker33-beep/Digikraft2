export const useBlog = () => {
  // Get all blog posts
  const getAllPosts = async () => {
    try {
      const { data } = await useAsyncData('blog-posts', () =>
        queryContent('blog')
          .sort({ date: -1 })
          .find()
      )
      return data
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return ref([])
    }
  }

  // Get featured posts
  const getFeaturedPosts = async (limit = 3) => {
    try {
      const { data } = await useAsyncData('featured-posts', () =>
        queryContent('blog')
          .where({ featured: true })
          .sort({ date: -1 })
          .limit(limit)
          .find()
      )
      return data
    } catch (error) {
      console.error('Error fetching featured posts:', error)
      return ref([])
    }
  }

  // Get recent posts for sidebar
  const getRecentPosts = async (limit = 2) => {
    try {
      const { data } = await useAsyncData('recent-posts', () =>
        queryContent('blog')
          .sort({ date: -1 })
          .limit(limit)
          .only(['title', 'image', 'date', '_path'])
          .find()
      )
      return data
    } catch (error) {
      console.error('Error fetching recent posts:', error)
      return ref([])
    }
  }

  // Get single post by slug
  const getPost = async (slug: string) => {
    try {
      const { data } = await useAsyncData(`blog-${slug}`, () =>
        queryContent('blog', slug).findOne()
      )
      return data
    } catch (error) {
      console.error('Error fetching post:', error)
      return ref(null)
    }
  }

  // Get posts by category
  const getPostsByCategory = async (category: string) => {
    try {
      const { data } = await useAsyncData(`blog-category-${category}`, () =>
        queryContent('blog')
          .where({ category })
          .sort({ date: -1 })
          .find()
      )
      return data
    } catch (error) {
      console.error('Error fetching posts by category:', error)
      return ref([])
    }
  }

  // Get posts by tag
  const getPostsByTag = async (tag: string) => {
    try {
      const { data } = await useAsyncData(`blog-tag-${tag}`, () =>
        queryContent('blog')
          .where({ tags: { $contains: tag } })
          .sort({ date: -1 })
          .find()
      )
      return data
    } catch (error) {
      console.error('Error fetching posts by tag:', error)
      return ref([])
    }
  }

  return {
    getAllPosts,
    getFeaturedPosts,
    getRecentPosts,
    getPost,
    getPostsByCategory,
    getPostsByTag
  }
}

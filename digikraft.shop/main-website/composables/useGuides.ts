export const useGuides = () => {
  // Get all guides
  const getAllGuides = async () => {
    const { data } = await useAsyncData('guides', () =>
      queryContent('/guides')
        .sort({ order: 1 })
        .find()
    )
    return data
  }

  // Get guides by category
  const getGuidesByCategory = async (category: string) => {
    const { data } = await useAsyncData(`guides-${category}`, () =>
      queryContent('/guides')
        .where({ category })
        .sort({ order: 1 })
        .find()
    )
    return data
  }

  // Get single guide
  const getGuide = async (slug: string) => {
    const { data } = await useAsyncData(`guide-${slug}`, () =>
      queryContent('/guides', slug).findOne()
    )
    return data
  }

  return {
    getAllGuides,
    getGuidesByCategory,
    getGuide
  }
}

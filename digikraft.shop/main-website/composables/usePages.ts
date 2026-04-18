export const usePages = () => {
  // Get any static page by slug
  const getPage = async (slug: string) => {
    const { data } = await useAsyncData(`page-${slug}`, () =>
      queryContent('/pages', slug).findOne()
    )
    return data
  }

  return {
    getPage
  }
}

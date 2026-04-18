export const useSidebarConfig = async () => {
  const { data: config } = await useAsyncData('sidebar-config', () => 
    queryContent('/config/sidebar').findOne()
  )

  const getSections = () => {
    if (!config.value?.sections) return []
    return config.value.sections
      .filter((section: any) => section.enabled)
      .sort((a: any, b: any) => a.order - b.order)
  }

  const getHotOffers = () => {
    return config.value?.hotOffers || []
  }

  const getTrending = () => {
    return config.value?.trending || []
  }

  const isSectionEnabled = (sectionId: string) => {
    const section = config.value?.sections?.find((s: any) => s.id === sectionId)
    return section?.enabled ?? false
  }

  return {
    config,
    getSections,
    getHotOffers,
    getTrending,
    isSectionEnabled
  }
}

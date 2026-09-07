export const capitalizeFirstLetter = (string="") => {
  if(!string) return ""
    return string?.charAt(0).toUpperCase() + string.slice(1)
}


export const getTermInitalValues = (data=null) => {
  if(data) {
    return {
      id: data?.id,
      name: data?.name,
      slug: data?.slug,
      description: data?.description,
      parent: data?.parent,
    }
  }
  return {
    name: "",
    slug: "",
    description: "",
    parent: "",
  }
}
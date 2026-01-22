export const capitalizeFirstLetter = (string="") => {
  console.log({string})
  if(!string) return ""
    return string?.charAt(0).toUpperCase() + string.slice(1)
}


export const getTermInitalValues = (ID = null, data) => {
  if(ID && data.length > 0) {
    const filteredItem = data.find(item => Number(item.id) === Numbner(ID))
    
    return {
      name: filteredItem?.name,
      slug: filteredItem?.slug,
      description: filteredItem?.description,
      parent: filteredItem?.parent,
    }
  }
  return {
    name: "",
    slug: "",
    description: "",
    parent: "",
  }
}
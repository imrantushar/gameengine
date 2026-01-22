export const capitalizeFirstLetter = (string="") => {
  console.log({string})
  if(!string) return ""
    return string?.charAt(0).toUpperCase() + string.slice(1)
}


export const getTermInitalValues = (ID = null, data) => {
  if(ID && data.length > 0) {
    return {}
  }
  return {}
}
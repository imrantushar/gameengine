export const getPointTypesInitialValues = (id=null, data) => {
  if (id && data && data.length > 0) {
    const filteredData = data.find(item => Number(item.id) === Number(id))
    
    return {
      name: filteredData?.name,
      plural_name: filteredData?.plural_name,
      requirements : filteredData?.requirements,
      status : filteredData?.status,
    }
  }

  return {
    name: "",
    plural_name: "",
    requirements : [],
    status : 'publish',
  }
}

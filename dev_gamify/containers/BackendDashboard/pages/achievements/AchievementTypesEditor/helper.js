export const getAchivementsInitialValues = (id=null, data) => {
  if (id && data && data.length > 0) {
    const filteredData = data.find(item => Number(item.id) === Number(id))
    
    return {
      id: filteredData?.id,
      title: filteredData?.title,
      description: filteredData?.description,
      category: filteredData?.category,
      max_earnings_per_user: filteredData?.max_earnings_per_user,
      unlock_with_points_enabled: filteredData?.unlock_with_points_enabled,
      required_points_amount: filteredData?.required_points_amount,
      congratulations_message: filteredData?.congratulations_message,
      requirements: filteredData?.requirements
    }
  }

  return {
    title: "",
    description: "",
    category: [],
    max_earnings_per_user: 0,
    unlock_with_points_enabled: false,
    required_points_amount: 0,
    congratulations_message: "",
    requirements: []
  }
}
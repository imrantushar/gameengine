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
      requirements: filteredData?.requirements,
      restrict_unlock: filteredData?.restrict_unlock,
      required_achievement_id: filteredData?.required_achievement_id,
      required_level_id: filteredData?.required_level_id,
    }
  }

  return {
    title: "",
    description: "",
    category: [],
    max_earnings_per_user: 0,
    unlock_with_points_enabled: false,
    required_points_amount: 0,
    restrict_unlock: false,
    required_achievement_id: 0,
    required_level_id: 0,
    congratulations_message: "",
    requirements: []
  }
}
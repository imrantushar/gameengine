export const getAchivementsInitialValues = (id=null, data) => {
  if (id && data && data.length > 0) {
    const filteredData = data.find(item => Number(item.id) === Number(id))
    
    return {
      id: filteredData?.id,
      title: filteredData?.title,
      description: filteredData?.description,
      category_id: filteredData?.category_id,
      max_earnings_per_user: filteredData?.max_earnings_per_user,
      unlock_with_points_enabled: filteredData?.unlock_with_points_enabled,
      required_points_amount: filteredData?.required_points_amount,
      congratulations_message: filteredData?.congratulations_message,
      requirements: filteredData?.requirements,
      is_restricted: filteredData?.is_restricted,
      required_point_type_id: filteredData?.required_point_type_id,
      required_achievement_id: filteredData?.required_achievement_id,
      restriction_message: filteredData?.restriction_message,
      required_level_id: filteredData?.required_level_id,
    }
  }

  return {
    title: "",
    description: "",
    category_id: 0,
    max_earnings_per_user: 0,
    unlock_with_points_enabled: true,
    required_points_amount: 0,
    is_restricted: false,
    required_achievement_id: 0,
    required_point_type_id: 0,
    required_level_id: 0,
    restriction_message: "",
    congratulations_message: "",
    requirements: []
  }
}
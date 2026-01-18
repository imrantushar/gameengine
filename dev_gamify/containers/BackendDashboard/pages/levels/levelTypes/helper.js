export const getLevelsInitialValues = (id=null, data = []) => {
  if (id && data && data.length > 0) {
    const filteredData = data.find(item => Number(item.id) === Number(id))
    
    return {
      id: filteredData?.id,
      title: filteredData?.title,
      congratulations_message: filteredData?.congratulations_message,
      unlock_with_points_enabled: filteredData?.unlock_with_points_enabled,
      min_points: filteredData?.min_points,
      max_points: filteredData?.max_points,
      point_type_id: filteredData?.point_type_id,
      icon: filteredData?.icon,
      category: filteredData?.category,
      requirements: filteredData?.requirements,
      restrict_unlock: filteredData?.restrict_unlock,
      required_achievement_id: filteredData?.required_achievement_id,
      required_level_id: filteredData?.required_level_id,
    }
  }

  return {
    title: "",
    congratulations_message: "",
    unlock_with_points_enabled: "",
    min_points: 0,
    max_points: false,
    point_type_id: 0,
    icon: "",
    category: [{
      value: 'progression',
      label: 'Progression',
      is_selected: false,
    }],
    requirements: [],
    restrict_unlock: false,
    required_achievement_id: 0,
    required_level_id: 0,
  }
}
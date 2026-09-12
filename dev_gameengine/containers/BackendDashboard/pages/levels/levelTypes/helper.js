import { __ } from "@wordpress/i18n";

export const DEFAULT_CONGRATULATIONS = __(
  "Congratulations! You have reached a new level. Keep going to unlock the next one.",
  "gameengine"
);

export const DEFAULT_DESCRIPTION = __(
  "Describe what members get at this level and what they need to do to reach it.",
  "gameengine"
);

export const getLevelsInitialValues = (id=null, data = []) => {
  if (id && data && data.length > 0) {
    const filteredData = data.find(item => Number(item.id) === Number(id))
    
    return {
      id: filteredData?.id,
      title: filteredData?.title,
      // Both were missing, so opening a level and saving it cleared its plural
      // name and reset priority to 0 — which is what orders the whole ladder.
      plural_name: filteredData?.plural_name ?? "",
      priority: filteredData?.priority ?? 0,
      congratulations_message: filteredData?.congratulations_message,
      unlock_with_points_enabled: filteredData?.unlock_with_points_enabled,
      min_points: filteredData?.min_points,
      max_points: filteredData?.max_points,
      point_type_id: filteredData?.point_type_id,
      icon: filteredData?.icon,
      color: filteredData?.color || "#6c5ce7",
      category_id: filteredData?.category_id,
      requirements: filteredData?.requirements,
      is_restricted: filteredData?.is_restricted,
      required_achievement_id: filteredData?.required_achievement_id,
      restriction_message: filteredData?.restriction_message,
      required_level_id: filteredData?.required_level_id,
      status: filteredData?.status,
      description: filteredData?.description || "",
    }
  }

  return {
    title: "",
    plural_name: "",
    priority: 0,
    // A new level starts with something sensible to show rather than two empty
    // editors. Both are plain text on purpose: nothing substitutes tokens in
    // these fields, so a {placeholder} would reach members verbatim.
    congratulations_message: DEFAULT_CONGRATULATIONS,
    description: DEFAULT_DESCRIPTION,
    unlock_with_points_enabled: true,
    min_points: 0,
    max_points: 0,
    point_type_id: 0,
    icon: "",
    color: "#6c5ce7",
    category_id: 0,
    requirements: [],
    is_restricted: false,
    required_achievement_id: 0,
    restriction_message: "",
    required_level_id: 0,
    status: 'publish',
  }
}
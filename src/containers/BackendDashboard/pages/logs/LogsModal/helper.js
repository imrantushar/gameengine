export const getLogsInitailaValues = (formData=null) => {
  if(formData) {  
    const points = parseInt(formData?.points_awarded || formData?.meta?.points || 0);
    return {
      id: formData?.id,
      user_id: formData?.user_id,
      points_awarded: Math.abs(points),
      type: points >= 0 ? 'award' : 'deduct',
      trigger_key: formData?.trigger_key,
      message: formData?.message,
      schedule_date: ''
    }
  }

  return {
    user_id: '',
    points_awarded: 10,
    type: 'award',
    trigger_key: 'manual_adjustment',
    message: '',
    schedule_date: ''
  }
}
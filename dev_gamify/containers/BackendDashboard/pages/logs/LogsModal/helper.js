export const getLogsInitailaValues = (formData=null) => {
  if(formData) {  
    const points = parseInt(formData?.points_awarded || formData?.meta?.points || 0);
    return {
      id: formData?.id,
      points_awarded: Math.abs(points),
      type: points >= 0 ? 'award' : 'deduct',
      reference: formData?.trigger_key,
      message: formData?.message,
      schedule_date: ''
    }
  }
  
  return {
    points_awarded: 10,
    type: 'award',
    reference: 'manual_adjustment',
    message: '',
    schedule_date: ''
  }
}
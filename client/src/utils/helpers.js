export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return '#4caf50'
    case 'Medium':
      return '#ff9800'
    case 'Hard':
      return '#f44336'
    default:
      return '#9e9e9e'
  }
}

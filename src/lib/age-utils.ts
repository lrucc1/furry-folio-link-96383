import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'

export const calculateAge = (dateOfBirth: string | null): string => {
  if (!dateOfBirth) return 'Unknown'
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  const years = differenceInYears(today, birthDate)
  const months = differenceInMonths(today, birthDate) % 12
  const days = differenceInDays(today, birthDate) % 30 // Approximate
  
  if (years > 0) {
    if (months > 0) {
      return `${years}y ${months}m`
    }
    return `${years} year${years === 1 ? '' : 's'}`
  } else if (months > 0) {
    return `${months} month${months === 1 ? '' : 's'}`
  } else if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'}`
  }
  
  return 'Newborn'
}
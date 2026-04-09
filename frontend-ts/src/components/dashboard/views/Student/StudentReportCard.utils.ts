export type GradeRecord = {
  subject: string
  score: number
  grade: string
  teacher: string
  performance?: string
  teacherReport?: string
}

export const reportDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export function getGradeLetter(score: number) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function getPerformanceText(score: number, performance?: string) {
  return performance || (score >= 50 ? 'Satisfactory' : 'Needs Improvement')
}

export function getPerformanceLabel(averageScore: number) {
  if (averageScore >= 85) return 'Excellent progress'
  if (averageScore >= 70) return 'Solid performance'
  return 'Needs support'
}

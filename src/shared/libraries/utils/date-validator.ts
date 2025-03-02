/**
 * Validate Date Format (YYYY-MM-DD)
 */
export function validateDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);

  const reconstructed = new Date(year, month, day);
  return reconstructed.getFullYear() === year && reconstructed.getMonth() === month && reconstructed.getDate() === day;
}

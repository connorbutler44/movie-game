export function isFutureDate(date: Date): boolean {
  const now = new Date();

  // Set the time of both dates to midnight for a fair comparison
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return date > now;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let timeString = '';
  if (hours > 0) {
    timeString += `${hours}h `;
  }
  if (minutes > 0) {
    timeString += `${minutes}m `;
  }
  timeString += `${remainingSeconds}s`;

  return timeString;
}
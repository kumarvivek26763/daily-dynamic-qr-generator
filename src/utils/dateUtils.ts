import { DateFormatOption } from '../types';

/**
 * Returns today's device local date formatted as YYYY-MM-DD.
 * Strictly avoids UTC/timezone offset issues by using device local date methods.
 */
export function getCurrentLocalDate(now: Date = new Date()): string {
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(d: Date, format: DateFormatOption = 'YYYY-MM-DD'): string {
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`;
    case 'YYYY/MM/DD':
      return `${yyyy}/${mm}/${dd}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYYMMDD':
      return `${yyyy}${mm}${dd}`;
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

export function buildDynamicString(
  date: Date,
  prefix: string,
  suffix: string,
  separator: string,
  dateFormat: DateFormatOption = 'YYYY-MM-DD',
  customTemplate?: string,
  useCustomTemplate: boolean = false
): string {
  const dateFormatted = formatDate(date, dateFormat);

  if (useCustomTemplate && customTemplate && customTemplate.trim()) {
    return customTemplate
      .replace(/\{prefix\}/gi, prefix.trim())
      .replace(/\{date\}/gi, dateFormatted)
      .replace(/\{suffix\}/gi, suffix.trim())
      .replace(/\{separator\}/gi, separator);
  }

  const cleanPrefix = prefix.trim();
  const cleanSuffix = suffix.trim();

  const parts: string[] = [];
  if (cleanPrefix) parts.push(cleanPrefix);
  parts.push(dateFormatted);
  if (cleanSuffix) parts.push(cleanSuffix);

  return parts.join(separator);
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; totalMs: number } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs: diffMs };
}

export function getDaysLoop(startDate: Date, totalDays: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    dates.push(d);
  }
  return dates;
}

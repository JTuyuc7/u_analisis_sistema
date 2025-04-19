import { z } from 'zod';
import { format, toZonedTime } from 'date-fns-tz';

export const generateFieldErrors = (errors: z.ZodIssue[]) => { 

  const fieldErrors: Record<string, string> = {};
  errors.forEach((error) => {
    if (error.path[0]) {
      fieldErrors[error.path[0]] = error.message
    }
  });
  return fieldErrors;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(amount);
};

export function debounce<T extends (...args: string[]) => void>(func: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return function (...args: string[]) {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  } as T
}

export function formatCardNumber(str: string): string {
  return str
    .replace(/\D/g, '')            // strip non‑digits
    .replace(/(.{4})/g, '$1-')     // after every 4 chars, insert a hyphen
    .slice(0, -1);                 // remove trailing hyphen
}

export const formatDate = (rawDate: string | Date): string => {
  if (!rawDate) return '-';

  try {
    const timeZone = 'America/Guatemala';
    let dateObj: Date;

    if (typeof rawDate === 'string') {
      const pgTimestamptzRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})([+-]\d{2})$/;
      const match = rawDate.match(pgTimestamptzRegex);

      if (match) {
        // Extract the date part and timezone offset
        const [, datePart, tzOffset] = match;
        // Convert to ISO format
        const isoString = `${datePart.replace(' ', 'T')}:00${tzOffset}:00`;
        dateObj = new Date(isoString);
      } else {
        // Try to parse it directly first
        dateObj = new Date(rawDate);

        // If that fails or creates an invalid date, try different approaches
        if (isNaN(dateObj.getTime())) {
          // Handle PostgreSQL timestamp format (2025-04-18 12:30:00)
          if (rawDate.includes('-') && rawDate.includes(':')) {
            // Try with explicit UTC marker
            dateObj = new Date(rawDate.replace(' ', 'T') + 'Z');

            // If still invalid, try without Z
            if (isNaN(dateObj.getTime())) {
              dateObj = new Date(rawDate.replace(' ', 'T'));
            }
          }
          // Handle numeric timestamp (milliseconds)
          else if (!isNaN(Number(rawDate))) {
            dateObj = new Date(Number(rawDate));
          }
        }
      }
    } else {
      dateObj = rawDate;
    }

    // Validate the date object
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object created from:', rawDate);
      return '-';
    }

    // Format the date for Guatemala timezone
    const zonedDate = toZonedTime(dateObj, timeZone);
    return format(zonedDate, 'dd/MM/yyyy hh:mm a', { timeZone });
  } catch (error) {
    console.error('Error formatting date:', error, 'Raw value:', rawDate);
    return '-';
  }
};
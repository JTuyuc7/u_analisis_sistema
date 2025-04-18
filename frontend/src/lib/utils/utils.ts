import { z } from 'zod';

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

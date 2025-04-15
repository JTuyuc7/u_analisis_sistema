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
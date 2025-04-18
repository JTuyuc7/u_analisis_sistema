import { apiPrivateClient } from '@/lib/api/apiClient';
import { generateFieldErrors } from '@/lib/utils/utils';
import { z } from 'zod';
import { getBalanceToTransfer } from './utilsAction';

export interface ITransferFormState {
  state: {
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    description?: string;
    msg: string;
  }
  errors?: {
    fromAccountId?: string;
    toAccountId?: string;
    amount?: string;
    description?: string;
  };
  success?: boolean;
  error?: boolean;
}

const transferAccountSchema = z.object({
  fromAccountId: z.string().length(10, "Please select an account.").regex(/^\d+$/, "Account ID must contain only numbers"),
  toAccountId: z.string().length(10, 'Account to transfer to is required.').regex(/^\d+$/, "Account ID must contain only numbers"),
  amount: z.string().min(1, 'Amount is required.').regex(/^(0|[1-9]\d*)(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places').transform((val) => parseFloat(val)),
  description: z.string().optional(),
})

export default async function trasnferAction(formState: ITransferFormState, formData: FormData): Promise<ITransferFormState> {

  const validateFields = transferAccountSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    toAccountId: formData.get("toAccountId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  })

  if (validateFields.data?.fromAccountId === validateFields.data?.toAccountId) {
    return {
      state: {
        fromAccountId: formData.get("fromAccountId") as string || "",
        toAccountId: formData.get("toAccountId") as string || "",
        amount: formData.get("amount") as string || "",
        description: formData.get("description") as string || "",
        msg: "Cannot transfer to the same account",
      },
      errors: {
        toAccountId: "Cannot transfer to the same account",
      },
      success: false,
      error: true,
    }
  }

  const responseBalance = await getBalanceToTransfer(formData.get('fromAccountId') as string)
  if (parseFloat(formData.get("amount") as string) > parseFloat(responseBalance.balance)) {
    return {
      state: {
        fromAccountId: formData.get("fromAccountId") as string || "",
        toAccountId: formData.get("toAccountId") as string || "",
        amount: formData.get("amount") as string || "",
        description: formData.get("description") as string || "",
        msg: "Insufficient balance to complete the transaction",
      },
      errors: {
        amount: "Insufficient balance to complete the transaction",
      },
      success: false,
      error: true,
    }
  }

  if (!validateFields.success) {
    const fieldErrors: Record<string, string> = generateFieldErrors(validateFields.error.errors);

    return {
      state: {
        fromAccountId: formData.get("fromAccountId") as string || "",
        toAccountId: formData.get("toAccountId") as string || "",
        amount: formData.get("amount") as string || "",
        description: formData.get("description") as string || "",
        msg: "Please check the fields",
      },
      errors: fieldErrors,
      success: false,
      error: true,
    }
  }

  try {
    const response = await apiPrivateClient.post("/accounts/transfer", {
      fromAccountId: validateFields.data.fromAccountId,
      toAccountId: validateFields.data.toAccountId,
      amount: validateFields.data.amount,
      description: validateFields.data.description || "",
    })

    if (response.status === 200) {
      return {
        state: {
          fromAccountId: formData.get("fromAccountId") as string || "",
          toAccountId: formData.get("toAccountId") as string || "",
          amount: formData.get("amount") as string || "",
          description: formData.get("description") as string || "",
          msg: "Transfer successful",
        },
        errors: {},
        success: true,
        error: false,
      }
    } else {
      return {
        state: {
          fromAccountId: formData.get("fromAccountId") as string || "",
          toAccountId: formData.get("toAccountId") as string || "",
          amount: formData.get("amount") as string || "",
          description: formData.get("description") as string || "",
          msg: "Something went wrong, please try again later",
        },
        errors: {},
        success: false,
        error: true,
      }
    }
  } catch (error : unknown) {

    // Type narrowing for axios error
    const errorMessage = error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data ?
      error.response.data.message as string :
      "An unexpected error occurred";
    

    return {
      state: {
        fromAccountId: formData.get("fromAccountId") as string || "",
        toAccountId: formData.get("toAccountId") as string || "",
        amount: formData.get("amount") as string || "",
        description: formData.get("description") as string || "",
        msg: errorMessage,
      },
      errors: {},
      success: false,
      error: true,
    }
  }
}
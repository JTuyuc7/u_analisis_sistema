import { apiPrivateClient } from "@/lib/api/apiClient";
import { createAccountState } from "@/lib/interfaces";
import { generateFieldErrors } from "@/lib/utils/utils";
import { z } from "zod";

const accountCreationSchema = z.object({
  accountType: z.string().min(2, "Please select an account type"),
  accountName: z.string().min(2, "Please enter an account name"),
  pin: z.string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d+$/, "PIN must contain only numbers")
    .transform(val => parseInt(val, 10)), // Convert to number after validation
})

export async function createAccountAction(formState: createAccountState, formData: FormData) : Promise<createAccountState> {
  const validateFields = accountCreationSchema.safeParse({
    accountType: formData.get("accountType"),
    accountName: formData.get("accountName"),
    pin: formData.get("security_pin"),
  })

  if (!validateFields.success) {
    const fieldErrors: Record<string, string> = generateFieldErrors(validateFields.error.errors);

    return {
      state: {
        accountType: formData.get("accountType") as string || "",
        accountName: formData.get("accountName") as string || "",
        pin: formData.get("security_pin") as string || "",
        msg: "Please check the fields",
      },
      errors: fieldErrors,
      success: false,
    }
  }

  try {

    const response = await apiPrivateClient.post("/accounts", {
      accountType: validateFields.data.accountType,
      accountName: validateFields.data.accountName,
      security_pin: String(validateFields.data.pin),
    })

    if (response.status === 201) {
      return {
        state: {
          accountType: formData.get("accountType") as string || "",
          accountName: formData.get("accountName") as string || "",
          pin: formData.get("security_pin") as string || "",
          msg: "Account created successfully",
        },
        errors: {},
        success: true,
      }
    } else {
      return {
        state: {
          accountType: formData.get("accountType") as string || "",
          accountName: formData.get("accountName") as string || "",
          pin: formData.get("security_pin") as string || "",
          msg: "An error occurred while creating the account",
        },
        errors: {},
        success: false,
      }
    }
  } catch (error: unknown) { 
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
    
    console.error(errorMessage, "error");
    return {
      state: {
        accountType: formData.get("accountType") as string || "",
        accountName: formData.get("accountName") as string || "",
        pin: formData.get("security_pin") as string || "", // Fixed from "pin" to "security_pin"
        msg: errorMessage,
      },
      errors: {},
      success: false,
    }
  }
}
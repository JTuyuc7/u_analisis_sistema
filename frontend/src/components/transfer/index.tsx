import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";

import {
  Check,
  Close,
} from '@mui/icons-material'
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { IAccountFinderProps, ISingleAccountFinderProps, TransferFormData } from "@/lib/interfaces";
import RenderAccountList from "./renderAccountList";
import trasnferAction from "@/app/actions/transferAction";
import { debounce } from "@/lib/utils/utils";
import { getAccountByAccountNumber } from "@/app/actions";
import { toast } from 'react-toastify';
import RenderContent from "../common/renderContent";

interface TransferPageProps {
  onHandleCancelView: () => void
}

export default function TransferPage({ onHandleCancelView }: TransferPageProps) {
  const accounts = useSelector((state: RootState) => state.account.accounts);
  const latestAccount = useRef('')
  const [localState, setLocalState] = useState<TransferFormData>({
    account: { account_id: "", account_number: "", availableAmount: "" },
    toAccountId: "",
    amount: "",
    description: "",
    toAccountDetails: { accountId: "", toAccountName: "" }
  });

  const [formState, action, isPending] = useActionState(trasnferAction, {
    state: {
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      description: "",
      msg: ""
    },
    success: false,
    error: false,
  })
  const [accountFormState, accountAction, accountIsPending] = useActionState(
    async (
      prevState: IAccountFinderProps,
      formData: FormData
    ): Promise<IAccountFinderProps> => {
      const accountId = latestAccount.current
      if (accountId.length === 10) {
        return await getAccountByAccountNumber(prevState, formData, accountId)
      }
      return {
        success: false,
        error: false,
        data: {
          account: {} as ISingleAccountFinderProps,
          msg: 'Account ID must be 10 characters',
        },
      }
    },
    {
      success: false,
      error: false,
      data: {
        account: {} as ISingleAccountFinderProps,
        msg: '',
      },
    }
  )

  const resetAllStates = () => {
    setLocalState({
      account: { account_id: "", account_number: "", availableAmount: "" },
      toAccountId: "",
      amount: "",
      description: "",
      toAccountDetails: { accountId: "", toAccountName: "" }
    });
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((value: string) => {
      latestAccount.current = value
      const form = new FormData()
      startTransition(() => {
        accountAction(form)
      })
    }, 1000),
    [accountAction]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalState({ ...localState, toAccountId: value })
    debouncedFetch(value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('fromAccountId', localState.account.account_number)
    formData.append('toAccountId', localState.toAccountId)
    formData.append('amount', localState.amount)
    formData.append('description', localState.description)
    startTransition(() => {
      action(formData)
    })
  }

  const errorHelperText = () => {
    let errorText: string = ""
    if (formState.errors?.amount) {
      errorText = formState.errors.amount
    }
    if (parseFloat(localState.amount) > parseFloat(localState.account.availableAmount)) {
      errorText = "Amount must be less than available balance"
    }
    return { errorText }
  }

  const accountHelperText = () => {
    let errorText: string = ""
    if (accountFormState.error) {
      errorText = accountFormState.data.msg
    }

    if ((localState.toAccountId === localState.account.account_number) && localState.toAccountId.length === 10) {
      errorText = "You cannot transfer money to the same account"
    }
    return { errorText }
  }

  const shouldDisableButton = () => (localState.toAccountId === localState.account.account_number) && localState.toAccountId.length === 10

  useEffect(() => {
    if (formState.state.msg) {
      if (formState.success) {
        toast.success(formState.state.msg, {
          toastId: 'transfer-success',
          onClose: () => {
            resetAllStates()
          },
          autoClose: 2000,
        });
      } else if (formState.error) {
        toast.error(formState.state.msg, {
          toastId: 'transfer-error',
          onClose: () => {
            resetAllStates()
          },
          autoClose: 2000,
        });
      }
    }
    return () => {
      toast.dismiss('transfer-success');
      toast.dismiss('transfer-error');
    };
  }, [formState.success, formState.error, formState.state.msg]);

  if (!accounts || accounts.length === 0) { 
    return (
      <RenderContent title="" titleColor="primary.main">
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {"You don't have any accounts to transfer money from. Please create an account first."}
          </Typography>
        </Box>
      </RenderContent>
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 'sm', width: '100%' }}
    >
      <RenderAccountList
        accounts={accounts}
        formData={localState}
        handleFromAccountChange={(account_id, account_number, availableAmount) => {
          setLocalState({ ...localState, account: { account_id, account_number, availableAmount } });
        }
        }
        errors={formState.errors}
        title="Select Account to Transfer From"
      />

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transfer Details
        </Typography>

        <Stack spacing={3}>
          <TextField
            label={localState.toAccountId && accountFormState.success ? `Account Name: ${accountFormState.data.account?.first_name} ${accountFormState.data.account?.last_name}` : "Account Number to Transfer To"}
            name="toAccountNumber"
            required
            value={localState.toAccountId}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 10 }}
            error={accountFormState.error || shouldDisableButton()}
            helperText={accountHelperText().errorText}
            placeholder="Enter the 10-digit account number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {accountIsPending ? (
                    <CircularProgress size="1rem" />
                  ) : accountFormState.success ? (
                    <IconButton>
                      <Check color="success" />
                    </IconButton>
                  ) : accountFormState.error ? (
                    <IconButton>
                      <Close color="error" />
                    </IconButton>
                  ) : null}

                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Amount"
            name="amount"
            id="amount"
            value={localState.amount}
            onChange={(e) => setLocalState({ ...localState, amount: e.target.value })}
            fullWidth
            required
            type="number"
            error={!!formState.errors?.amount || parseFloat(localState.amount) > parseFloat(localState.account.availableAmount)}
            helperText={errorHelperText().errorText}
            InputProps={{
              startAdornment: <InputAdornment position="start">Q</InputAdornment>,
            }}
            inputProps={{ min: 0, step: '0.01' }}
            placeholder="0.00"
          />

          <TextField
            label="Description"
            name="description"
            id="description"
            type="text"
            fullWidth
            placeholder="What is this transfer for?"
            multiline
            value={localState.description}
            onChange={(e) => setLocalState({ ...localState, description: e.target.value })}
            rows={2}
          />
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isPending || accountFormState.error || Number(localState.amount) > Number(localState.account.availableAmount) || shouldDisableButton()}
        >
          {isPending ? "Processing..." : "Transfer Money"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={onHandleCancelView}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

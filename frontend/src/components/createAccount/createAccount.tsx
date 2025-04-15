'use client'

import { startTransition, useActionState, useState } from 'react'
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  FormHelperText,
  Alert,
  SelectChangeEvent
} from '@mui/material'
import { createAccountAction } from '@/app/actions'

interface FormData {
  accountType: 'checking' | 'savings' | ''
  accountName: string
  pin: string
}

interface CreateAccountProps {
  onHandleCancelView: () => void
}

export default function CreateAccount({ onHandleCancelView }: CreateAccountProps) {
  const [localState, setLocalState] = useState<FormData>({
    accountType: '',
    accountName: '',
    pin: ''
  })
  const [formState, action, isPending] = useActionState(createAccountAction, {
    state: {
      accountType: '' as 'checking' | 'savings' | '',
      accountName: '',
      pin: '',
      msg: ''
    },
    success: false
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('accountType', localState.accountType)
    formData.append('accountName', localState.accountName)
    formData.append('security_pin', localState.pin)
    startTransition(() => {
      action(formData)
    })
    setLocalState({
      accountType: '',
      accountName: '',
      pin: ''
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 'sm', width: '100%' }}>
      <Stack spacing={3}>
        {formState.state.msg && (
          <Alert severity={formState.success ? "success" : "error"} sx={{ mb: 2 }}>
            {formState.state.msg}
          </Alert>
        )}
        <FormControl
          error={!!formState.errors?.accountType}
        >
          <InputLabel id="account-type-label">Account Type</InputLabel>
          <Select
            labelId="account-type-label"
            label="Account Type"
            required
            id='accountType'
            error={!!formState.errors?.accountType}
            name='accountType'
            value={localState.accountType}
            onChange={(e) => setLocalState({ ...localState, accountType: e.target.value as 'checking' | 'savings' })} // Update the type here

          >
            <MenuItem value="checking">Checking</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
          </Select>
          {formState.errors?.accountType && (
            <FormHelperText>{formState.errors.accountType}</FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Account Name"
          error={!!formState.errors?.accountName}
          id='accountName'
          name='accountName'
          required
          helperText={formState.errors?.accountName}
          value={localState.accountName}
          onChange={(e) => setLocalState({ ...localState, accountName: e.target.value })}

        />

        <TextField
          label="PIN (4 digits)"
          id='security_pin'
          required
          name='security_pin'
          helperText={formState.errors?.pin}
          error={!!formState.errors?.pin}
          value={localState.pin}
          onChange={(e) => setLocalState({ ...localState, pin: e.target.value })}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary"
            disabled={isPending || formState.state.msg !== ''} // Disable if there's a message
          >
            Create Account
          </Button>

          <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={onHandleCancelView}>
            {'Cancel'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

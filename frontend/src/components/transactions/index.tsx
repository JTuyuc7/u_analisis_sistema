'use client'

import { useState } from 'react'
import { Select, MenuItem, FormControl, InputLabel, Stack, SelectChangeEvent, Box } from '@mui/material'
// import CreateAccount from './createAccount'
import { IAccountDataProps } from '@/lib/interfaces'
import RenderContent from '../common/renderContent'
import { useDispatch } from 'react-redux'
import { setAccounts } from '@/lib/redux/slices/accountSlice'
import CreateAccount from '../createAccounts'
import TransferPage from '../transfer'


interface createAccountProps {
  accounts?: IAccountDataProps[]
}

interface ViewContentProps {
  onHandleCancelView: () => void
}

// Placeholder components for each action
const CheckTransactions = () => (
  <Box>
    <h2 className="text-xl mb-4">Check Transactions</h2>
    <FormControl fullWidth>
      <InputLabel>Select Account/Card</InputLabel>
      <Select defaultValue="">
        <MenuItem value="account1">Account 1</MenuItem>
        <MenuItem value="account2">Account 2</MenuItem>
        <MenuItem value="card1">Card 1</MenuItem>
      </Select>
    </FormControl>
  </Box>
)

const CreateNewAccount = ({ onHandleCancelView }: ViewContentProps) => (
  <RenderContent title="Create New Account">
    <CreateAccount onHandleCancelView={onHandleCancelView} />
  </RenderContent>
)

const DefaultViewPage = () => (
  <RenderContent title="Welcome to the Transactions Page">
    <p className="text-lg">Please select an action from the dropdown above.</p>
  </RenderContent>
)

const MakeTransfer = ({ onHandleCancelView }: ViewContentProps) => (
  <RenderContent title="Make Transfer">
    <TransferPage onHandleCancelView={onHandleCancelView} />
  </RenderContent>
)

export default function TransactionsPage({ accounts = [] }: createAccountProps) {
  const [selectedAction, setSelectedAction] = useState('')
  const dispatch = useDispatch()
  dispatch(setAccounts(accounts))

  const handleActionChange = (event: SelectChangeEvent) => {
    setSelectedAction(event.target.value as string)
  }

  const handleCancelView = () => {
    setSelectedAction('default-view')
  }

  const renderSelectedComponent = () => {
    switch (selectedAction) {
      case 'check-transactions':
        return <CheckTransactions />
      case 'create-account':
        return <CreateNewAccount onHandleCancelView={handleCancelView} />
      case 'make-transfer':
        return <MakeTransfer onHandleCancelView={handleCancelView} />
      case 'check-account-balance':
        return <DefaultViewPage />
      case 'default-view':
        return <DefaultViewPage />
      default:
        return <DefaultViewPage />
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 'md', margin: '0 auto', width: '100%' }}>
      <h1 className="text-3xl font-bold">Transactions</h1>
      <FormControl fullWidth>
        <InputLabel id="action-select-label">Select Action</InputLabel>
        <Select
          labelId="action-select-label"
          value={selectedAction}
          onChange={handleActionChange}
          label="Select Action"
        >
          <MenuItem value="check-transactions">Check Transactions</MenuItem>
          <MenuItem value="create-account">Create New Account</MenuItem>
          <MenuItem value="make-transfer">Make Transfer</MenuItem>
          <MenuItem value="check-account-balance">Check account balance</MenuItem>
          <MenuItem hidden value="default-view">Choose something</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ width: '100%', paddingTop: 5 }}>
        {renderSelectedComponent()}
      </Box>
    </Stack>
  )
}

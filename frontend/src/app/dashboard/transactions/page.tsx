'use client'

import { useState } from 'react'
import { Select, MenuItem, FormControl, InputLabel, Stack, SelectChangeEvent, Box } from '@mui/material'
import CreateAccount from '@/components/createAccount/createAccount'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}

interface RenderContent {
  title: string
  children: React.ReactNode
}

interface ViewContentProps {
  onHandleCancelView: () => void
}

const RenderContent = ({ title, children } : RenderContent) => {
  return (
    <Box sx={{ margin: '0 auto', display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <h2 className="text-xl mb-4 flex self-center">{title}</h2>
      {children}
    </Box>
  )
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
    <CreateAccount onHandleCancelView={onHandleCancelView}  />
  </RenderContent>
)

const DefaultViewPage = () => (
  <RenderContent title="Welcome to the Transactions Page">
    <p className="text-lg">Please select an action from the dropdown above.</p>
  </RenderContent>
)

const MakeTransfer = () => (
  <Box>
    <h2 className="text-xl mb-4">Make Transfer</h2>
    {/* Add your transfer form here */}
  </Box>
)

export default function TransactionsPage() {
  const [selectedAction, setSelectedAction] = useState('')

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
        return <MakeTransfer />
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
          <MenuItem hidden value="default-view">Default View</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ width: '100%', paddingTop: 5 }}>
        {renderSelectedComponent()}
      </Box>
    </Stack>
  )
}

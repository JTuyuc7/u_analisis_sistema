'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, MenuItem, FormControl, InputLabel, Stack, SelectChangeEvent, Box } from '@mui/material'
// import CreateAccount from './createAccount'
import { IAccountDataProps } from '@/lib/interfaces'
import RenderContent from '../common/renderContent'
import { useDispatch } from 'react-redux'
import { setAccounts } from '@/lib/redux/slices/accountSlice'
import CreateAccount from '../createAccounts'
import TransferPage from '../transfer'
import CheckBalanceMainContent from '../checkBalance'
import ToolTipComponent from '../ui/ToolTip'

interface createAccountProps {
  accounts?: IAccountDataProps[]
}

interface ViewContentProps {
  onHandleCancelView: () => void
}

const CreateNewAccount = ({ onHandleCancelView }: ViewContentProps) => (
  <RenderContent title="Create New Account">
    <CreateAccount onHandleCancelView={onHandleCancelView} />
  </RenderContent>
)

const DefaultViewPage = () => (
  <RenderContent title="Welcome to the Operations Page">
    <p className="text-lg">Please select an action from the dropdown above.</p>
  </RenderContent>
)

const MakeTransfer = ({ onHandleCancelView }: ViewContentProps) => (
  <RenderContent title="Make Transfer">
    <TransferPage onHandleCancelView={onHandleCancelView} />
  </RenderContent>
)

const CheckBalance = ({onHandleCancelView}: ViewContentProps) => (
  <RenderContent title="Check Balance" titleColor="primary.main">
    <CheckBalanceMainContent onHandleCancelView={onHandleCancelView} />
  </RenderContent>
)

export default function OperationsMainPage({ accounts = [] }: createAccountProps) {
  console.log("🚀 ~ OperationsMainPage ~ accounts:", accounts)
  const router = useRouter()
  const searchParams = useSearchParams()
  const actionParam = searchParams.get('action')
  
  const [selectedAction, setSelectedAction] = useState(actionParam || '')
  const dispatch = useDispatch()
  
  // Set accounts in the store only once when component mounts or accounts change
  useEffect(() => {
    dispatch(setAccounts(accounts))
  }, [accounts, dispatch])

  // Update URL when selectedAction changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedAction) {
      params.set('action', selectedAction)
    } else {
      params.delete('action')
    }
    
    // Update the URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false })
  }, [selectedAction, router, searchParams])

  const handleActionChange = (event: SelectChangeEvent) => {
    setSelectedAction(event.target.value as string)
  }

  const handleCancelView = () => {
    setSelectedAction('default-view')
  }

  const renderSelectedComponent = () => {
    switch (selectedAction) {
      case 'create-account':
        return <CreateNewAccount onHandleCancelView={handleCancelView} />
      case 'make-transfer':
        return <MakeTransfer onHandleCancelView={handleCancelView} />
      case 'check-balance':
        return <CheckBalance onHandleCancelView={handleCancelView} />
      case 'default-view':
        return <DefaultViewPage />
      default:
        return <DefaultViewPage />
    }
  }

  const isCompanyRevenue = accounts[0]?.account_type === 'company_revenue'

  return (
    <Stack spacing={3} sx={{ maxWidth: 'md', margin: '0 auto', width: '100%' }}>
      <h1 className="text-3xl font-bold">Operations {isCompanyRevenue && <ToolTipComponent title='Companies can only have 1 main revenue account' />} </h1>
      <FormControl fullWidth>
        <InputLabel id="action-select-label">Select Action</InputLabel>
        <Select
          labelId="action-select-label"
          value={selectedAction}
          onChange={handleActionChange}
          label="Select Action"
        >
          <MenuItem disabled={isCompanyRevenue} value="create-account"> Create New Account </MenuItem>
          <MenuItem value="make-transfer">Make Transfer</MenuItem>
          <MenuItem value="check-balance">Check Balance</MenuItem>
          <MenuItem hidden value="default-view">Choose something</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ width: '100%', paddingTop: 5 }}>
        {renderSelectedComponent()}
      </Box>
    </Stack>
  )
}

import { getAllUserAccount } from '@/app/actions'
import TransactionsPage from '@/components/transactions'

export default async function TransactionsMainPage() {
  const response = await getAllUserAccount()
  return <TransactionsPage accounts={response.data.accounts} />
}
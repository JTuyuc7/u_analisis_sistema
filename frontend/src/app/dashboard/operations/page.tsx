import { getAllUserAccount } from '@/app/actions'
import OperationsMainPage from '@/components/operations'

export default async function OperationsPage() {
  const response = await getAllUserAccount()
  return <OperationsMainPage accounts={response.data.accounts} />
}
import { getAllUserTransactions } from "@/app/actions";
import TransactionsMainPage from "@/components/transactions";


export default async function TransactionsPage() { 
  const { data: { transactions } } = await getAllUserTransactions()
  
  return <TransactionsMainPage transactions={transactions} />
}
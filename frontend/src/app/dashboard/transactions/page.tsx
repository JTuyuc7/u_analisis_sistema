'use client'

import { useState } from 'react'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2025-03-20', description: 'Salary', amount: 5000, type: 'credit' },
    { id: '2', date: '2025-03-21', description: 'Rent', amount: 1500, type: 'debit' },
    { id: '3', date: '2025-03-22', description: 'Groceries', amount: 200, type: 'debit' },
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/redux/store'
import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const ClientThemeProvider = dynamic(
  () => import('@/app/ClientThemeProvider').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => null
  }
)

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ClientThemeProvider>
        {/* <SessionProvider>{children}</SessionProvider> */}
        {children}
      </ClientThemeProvider>
    </Provider>
  )
}

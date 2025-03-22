// 'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
// import { useEffect } from 'react'
// import { useDispatch } from 'react-redux'
// import { validateToken } from '@/lib/redux/slices/authSlice'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Banca - GT',
  description: 'Construimos el futuro, juntos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const dispatch = useDispatch()
  
  // useEffect(() => {
  //   dispatch(validateToken())
  // }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

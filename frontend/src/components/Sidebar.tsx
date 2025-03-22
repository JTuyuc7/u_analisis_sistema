'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import Link from 'next/link'
import { 
  FaHome, 
  FaHistory, 
  FaUser, 
  FaExchangeAlt,
  FaUserShield
} from 'react-icons/fa'

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  console.log("🚀 ~ Sidebar ~ user:", user)
  const router = useRouter()

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/dashboard/home' },
    { icon: FaExchangeAlt, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: FaHistory, label: 'History', path: '/dashboard/history' },
    { icon: FaUser, label: 'Profile', path: '/dashboard/profile' },
  ]

  // Add admin route if user has admin role
  if (user.admin) {
    menuItems.push({ 
      icon: FaUserShield, 
      label: 'Admin', 
      path: '/dashboard/admin' 
    })
  }

  return (
    <div className="h-screen w-64 bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8 text-center">
        Dashboard
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition-colors"
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

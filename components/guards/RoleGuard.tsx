'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: 'admin' | 'user'
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRole = 'admin', fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return fallback || <div>Loading...</div>
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
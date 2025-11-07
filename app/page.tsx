import { redirect } from 'next/navigation'
import { RoleGuard } from '@/components/guards/RoleGuard'

export default function HomePage() {
  redirect('/dashboard')
}
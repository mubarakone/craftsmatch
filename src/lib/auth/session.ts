import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  return session
}

export async function getUserDetails() {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const supabase = createClient()
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return userDetails
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/sign-in')
  }
  
  return session
} 
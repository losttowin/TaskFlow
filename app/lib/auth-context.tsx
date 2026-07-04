'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import {
  getLocalUser,
  setLocalUser,
  clearLocalUser,
} from './local-storage'

type AuthUser = { id: string; email: string } | null

type AuthContextType = {
  user: AuthUser
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
        }
        setLoading(false)
      })

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email! })
          } else {
            setUser(null)
          }
        }
      )
      return () => listener.subscription.unsubscribe()
    } else {
      // Demo mode
      setUser(getLocalUser())
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message }
      return {}
    } else {
      const id = crypto.randomUUID()
      setLocalUser({ id, email })
      setUser({ id, email })
      return {}
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { error: error.message }
      return {}
    } else {
      const localUser = getLocalUser()
      if (localUser && localUser.email === email) {
        setUser(localUser)
        return {}
      }
      // Auto-register in demo mode
      const id = crypto.randomUUID()
      setLocalUser({ id, email })
      setUser({ id, email })
      return {}
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    } else {
      clearLocalUser()
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

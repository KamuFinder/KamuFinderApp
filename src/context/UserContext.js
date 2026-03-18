import { createContext, useContext } from "react"
import { useAuth } from "../hooks/Auth.js"

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}
import { useState, useEffect } from "react"
import { auth } from "../firebase/config"
import { onAuthStateChanged } from "firebase/auth"

export function useAuth() {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe

  }, [])

  return { user, loading }
}
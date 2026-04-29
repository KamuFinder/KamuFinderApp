import { createContext, useContext, useEffect } from "react"
import { useAuth } from "../hooks/Auth.js"
import { registerForPushNotificationsAsync } from "../utils/notifications.js"
import { firestore, USERS } from "../firebase/config.js"
import { doc, setDoc } from "firebase/firestore"

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <AuthContext.Provider value={user}>
      <PushTokenHandler /> 
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}

function PushTokenHandler() {
  const user = useUser()

  useEffect(() => {
    if (!user?.uid) return   

    const setup = async () => {
      const token = await registerForPushNotificationsAsync()
      if (!token) return

      try{
        await setDoc(doc(firestore, USERS, user.uid), {
          expoPushToken: token
        }, { merge: true })  
      } catch (error) {
        console.log("Error updating push token: ", error)  
      }
    }

    setup()
  }, [user?.uid])

  return null
}
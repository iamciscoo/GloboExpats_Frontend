import { useState, useEffect } from "react"
import { User } from "@/lib/types"
import { DEFAULT_USER } from "@/lib/constants"

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true"
    }
    return false
  })
  
  const [user, setUser] = useState<User>(DEFAULT_USER)
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loggedIn)
      if (loggedIn) {
        setIsVerifiedBuyer(true)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    setIsVerifiedBuyer(true)

    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userSession", JSON.stringify(user))
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsVerifiedBuyer(false)
    setIsAdmin(false)

    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userSession")
    }

    // Consider using router.push instead of window.location.href in the future
    alert("You have been successfully logged out.")
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return {
    isLoggedIn,
    user,
    isVerifiedBuyer,
    isAdmin,
    handleLogin,
    handleLogout,
  }
} 
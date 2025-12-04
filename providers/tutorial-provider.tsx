/**
 * Tutorial Provider - Manages onboarding tutorial state
 */

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TutorialContextType {
  isOpen: boolean
  startTutorial: () => void
  closeTutorial: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const startTutorial = () => {
    setIsOpen(true)
    // Mark as seen in localStorage
    localStorage.setItem('tutorial-seen', 'true')
  }

  const closeTutorial = () => setIsOpen(false)

  return (
    <TutorialContext.Provider value={{ isOpen, startTutorial, closeTutorial }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}

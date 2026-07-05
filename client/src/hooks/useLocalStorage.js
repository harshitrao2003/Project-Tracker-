// ============================================
// hooks/useLocalStorage.js
// useState that persists to localStorage
// Used to save filters across page navigation
// ============================================

import { useState, useEffect } from 'react'

// key          → localStorage key name
// initialValue → default value if nothing stored
const useLocalStorage = (key, initialValue) => {

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('localStorage error:', err)
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
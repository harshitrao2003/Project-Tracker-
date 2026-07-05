// ============================================
// hooks/useDebounce.js
// Delays updating a value until user stops
// typing for a specified duration
// Prevents excessive API calls on each keystroke
// ============================================

import { useState, useEffect } from 'react'

// value    → the value to debounce (search text)
// delay    → how long to wait in ms (default 400ms)
// Returns  → debounced value that only updates
//            after user stops typing
const useDebounce = (value, delay = 400) => {

  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set a timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup — cancel timer if value changes
    // before delay is reached
    // This is what makes debouncing work —
    // each keystroke cancels the previous timer
    return () => clearTimeout(timer)

  }, [value, delay])

  return debouncedValue
}

export default useDebounce
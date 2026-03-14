import { useState, useCallback } from 'react'

interface State<T> {
  past: T[]
  future: T[]
}

export function useUndoRedo<T>() {
  const [{ past, future }, setState] = useState<State<T>>({ past: [], future: [] })

  const push = useCallback((item: T) => {
    setState(s => ({ past: [...s.past, item], future: [] }))
  }, [])

  const undo = useCallback(() => {
    setState(s => {
      if (s.past.length === 0) return s
      const next = [...s.past]
      const popped = next.pop()!
      return { past: next, future: [popped, ...s.future] }
    })
  }, [])

  const redo = useCallback(() => {
    setState(s => {
      if (s.future.length === 0) return s
      const next = [...s.future]
      const popped = next.shift()!
      return { past: [...s.past, popped], future: next }
    })
  }, [])

  return {
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}

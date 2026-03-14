import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '../../src/annotation/useUndoRedo'

describe('useUndoRedo', () => {
  it('starts with empty stacks', () => {
    const { result } = renderHook(() => useUndoRedo())
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('push enables undo', () => {
    const { result } = renderHook(() => useUndoRedo())
    act(() => result.current.push('state-1'))
    expect(result.current.canUndo).toBe(true)
  })

  it('undo returns previous state and enables redo', () => {
    const { result } = renderHook(() => useUndoRedo<string>())
    act(() => {
      result.current.push('a')
      result.current.push('b')
    })
    act(() => result.current.undo())
    expect(result.current.canRedo).toBe(true)
  })

  it('redo re-applies undone state', () => {
    const { result } = renderHook(() => useUndoRedo<string>())
    act(() => {
      result.current.push('a')
      result.current.push('b')
      result.current.undo()
      result.current.redo()
    })
    expect(result.current.canRedo).toBe(false)
    expect(result.current.canUndo).toBe(true)
  })
})

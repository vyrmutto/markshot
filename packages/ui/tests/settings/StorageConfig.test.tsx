import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StorageConfig } from '../../src/settings/StorageConfig'
import type { StorageProvider } from '@capture/storage'

const mockProviders: StorageProvider[] = [
  { id: 'local', name: 'Local Storage', upload: vi.fn(), getHistory: vi.fn(), delete: vi.fn(), configure: vi.fn() },
  { id: 'imgur', name: 'Imgur', upload: vi.fn(), getHistory: vi.fn(), delete: vi.fn(), configure: vi.fn() },
]

describe('StorageConfig', () => {
  it('renders all providers as radio buttons', () => {
    render(
      <StorageConfig
        providers={mockProviders}
        activeProviderId="local"
        onProviderChange={vi.fn()}
      />
    )
    expect(screen.getByText('Local Storage')).toBeInTheDocument()
    expect(screen.getByText('Imgur')).toBeInTheDocument()
  })

  it('calls onProviderChange when a different provider is selected', () => {
    const onChange = vi.fn()
    render(
      <StorageConfig
        providers={mockProviders}
        activeProviderId="local"
        onProviderChange={onChange}
      />
    )
    fireEvent.click(screen.getByDisplayValue('imgur'))
    expect(onChange).toHaveBeenCalledWith('imgur')
  })

  it('marks the active provider as checked', () => {
    render(
      <StorageConfig
        providers={mockProviders}
        activeProviderId="imgur"
        onProviderChange={vi.fn()}
      />
    )
    const imgurRadio = screen.getByDisplayValue('imgur') as HTMLInputElement
    expect(imgurRadio.checked).toBe(true)
  })
})

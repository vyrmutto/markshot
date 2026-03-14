import { describe, it, expect, beforeEach } from 'vitest'
import { ProviderRegistry } from '../src/registry'
import type { StorageProvider } from '../src/interface'

const mockProvider: StorageProvider = {
  id: 'mock',
  name: 'Mock Provider',
  upload: async () => ({ id: '1', url: 'http://example.com/1' }),
  getHistory: async () => [],
  delete: async () => {},
  configure: () => {},
}

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry

  beforeEach(() => { registry = new ProviderRegistry() })

  it('registers and retrieves a provider by id', () => {
    registry.register(mockProvider)
    expect(registry.get('mock')).toBe(mockProvider)
  })

  it('throws when retrieving unregistered provider', () => {
    expect(() => registry.get('unknown')).toThrow('Provider "unknown" not found')
  })

  it('lists all registered providers', () => {
    registry.register(mockProvider)
    expect(registry.list()).toHaveLength(1)
    expect(registry.list()[0].id).toBe('mock')
  })
})

// packages/storage/src/registry.ts
import type { StorageProvider } from './interface'

export class ProviderRegistry {
  private providers = new Map<string, StorageProvider>()

  register(provider: StorageProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: string): StorageProvider {
    const provider = this.providers.get(id)
    if (!provider) throw new Error(`Provider "${id}" not found`)
    return provider
  }

  list(): StorageProvider[] {
    return Array.from(this.providers.values())
  }
}

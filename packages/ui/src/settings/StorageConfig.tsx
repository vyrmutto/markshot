// packages/ui/src/settings/StorageConfig.tsx
import type { StorageProvider } from '@capture/storage'

interface Props {
  providers: StorageProvider[]
  activeProviderId: string
  onProviderChange: (id: string) => void
}

export function StorageConfig({ providers, activeProviderId, onProviderChange }: Props) {
  return (
    <section className="settings-section">
      <h2>Storage Provider</h2>
      <div className="provider-list">
        {providers.map(p => (
          <label key={p.id} className="provider-option">
            <input
              type="radio"
              name="provider"
              value={p.id}
              checked={activeProviderId === p.id}
              onChange={() => onProviderChange(p.id)}
            />
            <span>{p.name}</span>
          </label>
        ))}
      </div>
      <p className="settings-note">
        All data stays local by default. Cloud providers require your own credentials.
      </p>
    </section>
  )
}

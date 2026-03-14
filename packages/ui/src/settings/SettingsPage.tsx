// packages/ui/src/settings/SettingsPage.tsx
import { useState, useMemo } from 'react'
import { StorageConfig } from './StorageConfig'
import { LocalProvider, ImgurProvider, S3Provider } from '@capture/storage'

export function SettingsPage() {
  const providers = useMemo(() => [
    new LocalProvider(),
    new ImgurProvider(),
    new S3Provider(),
  ], [])

  const [activeId, setActiveId] = useState(() => providers[0].id)

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <StorageConfig
        providers={providers}
        activeProviderId={activeId}
        onProviderChange={setActiveId}
      />
    </div>
  )
}

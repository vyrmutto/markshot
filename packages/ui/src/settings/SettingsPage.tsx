// packages/ui/src/settings/SettingsPage.tsx
import { useState } from 'react'
import { StorageConfig } from './StorageConfig'
import { LocalProvider, ImgurProvider, S3Provider } from '@capture/storage'
import type { StorageProvider } from '@capture/storage'

const PROVIDERS: StorageProvider[] = [
  new LocalProvider(),
  new ImgurProvider(),
  new S3Provider(),
]

export function SettingsPage() {
  const [activeId, setActiveId] = useState('local')

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <StorageConfig
        providers={PROVIDERS}
        activeProviderId={activeId}
        onProviderChange={setActiveId}
      />
    </div>
  )
}

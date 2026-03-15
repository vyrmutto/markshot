import { test, expect, chromium } from '@playwright/test'
import path from 'path'

const EXTENSION_PATH = path.resolve('dist')

// Helper: load extension and extract its ID from chrome://extensions
async function loadExtension() {
  const context = await chromium.launchPersistentContext('', {
    headless: !!process.env.CI,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  })

  // chrome://extensions lists extension IDs in the DOM
  const page = await context.newPage()
  await page.goto('chrome://extensions/')
  await page.waitForSelector('extensions-manager')

  const extensionId = await page.evaluate(() => {
    const manager = document.querySelector('extensions-manager')
    const shadowRoot = manager?.shadowRoot
    const itemList = shadowRoot?.querySelector('extensions-item-list')
    const item = itemList?.shadowRoot?.querySelector('extensions-item')
    return item?.getAttribute('id') ?? ''
  })

  return { context, extensionId }
}

test('popup renders all capture mode buttons', async () => {
  const { context, extensionId } = await loadExtension()

  try {
    expect(extensionId).not.toBe('')

    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await popupPage.waitForLoadState('domcontentloaded')

    await expect(popupPage.getByText('Visible Area')).toBeVisible()
    await expect(popupPage.getByText('Full Page')).toBeVisible()
    await expect(popupPage.getByText('Select Region')).toBeVisible()
    await expect(popupPage.getByText('Element')).toBeVisible()
    await expect(popupPage.getByText('Delayed')).toBeVisible()
  } finally {
    await context.close()
  }
})

test('Capture tab is active by default', async () => {
  const { context, extensionId } = await loadExtension()

  try {
    expect(extensionId).not.toBe('')

    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await popupPage.waitForLoadState('domcontentloaded')

    // All 5 capture buttons should be visible without any tab click
    await expect(popupPage.getByText('Visible Area')).toBeVisible()
    await expect(popupPage.getByText('Full Page')).toBeVisible()
    await expect(popupPage.getByText('Select Region')).toBeVisible()
    await expect(popupPage.getByText('Element')).toBeVisible()
    await expect(popupPage.getByText('Delayed')).toBeVisible()

    // The Capture tab button should have the active class
    const captureTab = popupPage.getByRole('button', { name: 'Capture' })
    await expect(captureTab).toHaveClass(/active/)
  } finally {
    await context.close()
  }
})

test('History tab: shows empty state when no captures', async () => {
  const { context, extensionId } = await loadExtension()

  try {
    expect(extensionId).not.toBe('')

    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await popupPage.waitForLoadState('domcontentloaded')

    // Click the History tab
    await popupPage.getByRole('button', { name: 'History' }).click()

    // Empty state message should be visible
    await expect(popupPage.getByText('No captures yet')).toBeVisible()
  } finally {
    await context.close()
  }
})

test('Record tab: shows tab and screen record buttons', async () => {
  const { context, extensionId } = await loadExtension()

  try {
    expect(extensionId).not.toBe('')

    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await popupPage.waitForLoadState('domcontentloaded')

    // Click the Record tab
    await popupPage.getByRole('button', { name: 'Record' }).click()

    // Both record buttons should be visible
    await expect(popupPage.getByText('Record Tab')).toBeVisible()
    await expect(popupPage.getByText('Record Screen')).toBeVisible()
  } finally {
    await context.close()
  }
})

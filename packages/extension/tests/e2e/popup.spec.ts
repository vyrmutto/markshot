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

  expect(extensionId).not.toBe('')

  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
  await popupPage.waitForLoadState('domcontentloaded')

  await expect(popupPage.getByText('Visible Area')).toBeVisible()
  await expect(popupPage.getByText('Full Page')).toBeVisible()
  await expect(popupPage.getByText('Select Region')).toBeVisible()
  await expect(popupPage.getByText('Element')).toBeVisible()
  await expect(popupPage.getByText('Delayed')).toBeVisible()

  await context.close()
})

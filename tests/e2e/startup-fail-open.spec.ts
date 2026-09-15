import { expect, test } from '@playwright/test'

test('server-rendered page stays scrollable when application chunks fail', async ({ page }) => {
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, (route) => route.abort('failed'))
  await page.goto('/')
  await page.addStyleTag({
    content:
      '[data-startup-loader] { animation-delay: 0s !important; animation-duration: 1ms !important; }',
  })

  const loader = page.locator('[data-startup-loader]')
  await expect(loader).toHaveCSS('visibility', 'hidden')

  const state = await page.evaluate(() => ({
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    bodyOverflow: getComputedStyle(document.body).overflow,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: innerHeight,
  }))

  expect(state.scrollHeight).toBeGreaterThan(state.viewportHeight)
  expect(state.htmlOverflow).not.toBe('hidden')
  expect(state.bodyOverflow).not.toBe('clip')
})

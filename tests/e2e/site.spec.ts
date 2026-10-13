import { expect, test, type Page } from '@playwright/test'

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560]

async function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return errors
}

test.describe('layout', () => {
  test('no horizontal overflow and the hero fits at every width', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: width < 768 ? 800 : 900 })
      await page.goto('/')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0)

      for (const locator of [
        page.getByRole('heading', { level: 1 }),
        page.getByRole('search', { name: 'Find a cottage' }),
        page.getByRole('button', { name: 'Find cottages' }),
      ]) {
        const box = await locator.boundingBox()
        expect(box, `element missing at ${width}px`).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
    }
  })

  test('touch targets are at least 44px tall on phones', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only')
    await page.goto('/')
    const small = await page.evaluate(() => {
      const nodes = document.querySelectorAll<HTMLElement>(
        'header button, header a, main a[href], main button, main input, main select, footer a',
      )
      return [...nodes]
        .filter((el) => el.offsetParent !== null && !el.closest('.sr-only-focusable'))
        // Links inside running text (the photo credits) fall under WCAG's inline exception.
        .filter((el) => !el.closest('footer details li'))
        .map((el) => ({ label: (el.textContent || el.getAttribute('aria-label') || el.id).trim().slice(0, 40), h: el.getBoundingClientRect().height }))
        .filter((t) => t.h < 44)
    })
    expect(small).toEqual([])
  })

  test('renders without console errors', async ({ page }) => {
    const errors = await collectErrors(page)
    await page.goto('/')
    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(500)
    expect(errors).toEqual([])
  })
})

test.describe('navigation', () => {
  test('mobile menu opens, traps focus, closes on Escape and navigates', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only')
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    await toggle.click()
    const dialog = page.getByRole('dialog', { name: 'Site menu' })
    await expect(dialog).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/menu-open/)

    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mobile-menu'))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()

    await page.getByRole('button', { name: 'Open menu' }).click()
    await dialog.getByRole('link', { name: 'Questions' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('#questions')).toBeInViewport()
    expect(page.url()).toContain('#questions')
  })

  test('desktop nav links jump to their sections', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'desktop only')
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Legend' }).click()
    await expect(page.locator('#legend-title')).toBeInViewport()
  })

  test('skip link moves focus to the main content', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'keyboard flow checked on desktop')
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main')).toBeFocused()
  })
})

test.describe('interactions', () => {
  test('journey tabs switch by click and arrow keys', async ({ page }) => {
    await page.goto('/#journey')
    const tabs = page.getByRole('tablist', { name: 'Movements of the pilgrimage' })
    await tabs.getByRole('tab', { name: /Immerse/ }).click()
    await expect(page.getByRole('tabpanel')).toContainText('The dip at first light')
    await page.keyboard.press('ArrowRight')
    await expect(tabs.getByRole('tab', { name: /Depart/ })).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.getByRole('tab', { name: /Depart/ })).toBeFocused()
    await expect(page.getByRole('tabpanel')).toContainText('Leaving the ghats')
    await page.keyboard.press('Home')
    await expect(tabs.getByRole('tab', { name: /Arrive/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('time-of-day control changes the scene caption', async ({ page }) => {
    await page.goto('/#day')
    const group = page.getByRole('radiogroup', { name: 'Time of day' })
    await group.getByRole('radio', { name: 'Dusk' }).click()
    await expect(group.getByRole('radio', { name: 'Dusk' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('#day figcaption')).toContainText('Aarti on the ghats')
    await page.keyboard.press('ArrowRight')
    await expect(group.getByRole('radio', { name: 'Night' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('#day figcaption')).toContainText('Bhajans drift')
  })

  test('questions expand and collapse', async ({ page }) => {
    await page.goto('/#questions')
    const q = page.getByRole('button', { name: 'Do I pay anything when I send a request?' })
    await expect(q).toHaveAttribute('aria-expanded', 'false')
    await q.click()
    await expect(q).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('region', { name: 'Do I pay anything when I send a request?' })).toContainText('does not take payments')
    await q.click()
    await expect(q).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('booking', () => {
  const nextMonth = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  test('hero search asks for a place and a date', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Find cottages' }).click()
    await expect(page.getByLabel('Place')).toBeFocused()
    await expect(page.getByRole('search')).toContainText('Choose a city to search.')
    await expect(page.getByRole('search')).toContainText('Choose your check-in date.')
  })

  test('search lists the cottages for that city, then pre-fills the booking request', async ({ page }) => {
    const date = nextMonth()
    await page.goto('/')
    await page.getByLabel('Place').click()
    await page.getByRole('listbox').getByRole('option', { name: /^Haridwar/ }).click()
    await page.getByLabel('Check-in').first().fill(date)
    await page.getByRole('button', { name: 'Find cottages' }).click()

    await expect(page.locator('#cottages')).toBeInViewport()
    expect(page.url()).toContain('place=haridwar')
    expect(page.url()).toContain(`checkin=${date}`)
    const list = page.locator('#cottages ul')
    await expect(list.getByRole('article')).toHaveCount(2)
    await expect(page.locator('#cottages')).toContainText('2 cottages in Haridwar')
    await expect(page.getByRole('button', { name: 'Haridwar', pressed: true })).toBeVisible()

    await page.getByRole('button', { name: 'Request this cottage: Parvat Kutir' }).click()
    await expect(page.locator('#book')).toBeInViewport()
    await expect(page.locator('#book-place')).toHaveText('Haridwar')
    await expect(page.locator('#book input[name="place"]')).toHaveValue('haridwar')
    await expect(page.locator('#book-checkin')).toHaveValue(date)
    await expect(page.locator('#book-cottage')).toHaveValue('parvat-kutir')
  })

  test('the city picker shows each city over a photo and works from the keyboard', async ({ page }) => {
    await page.goto('/')
    const picker = page.getByRole('combobox', { name: 'Place' })
    await picker.focus()
    await page.keyboard.press('ArrowDown')
    await expect(picker).toHaveAttribute('aria-expanded', 'true')
    const list = page.getByRole('listbox', { name: 'Place' })
    await expect(list.getByRole('option')).toHaveCount(5)
    await expect(picker).toHaveAttribute('aria-activedescendant', 'hero-place-option-prayagraj')

    // Every city has its photograph behind it, and the photos load.
    const imgs = list.locator('img')
    await expect(imgs).toHaveCount(8)
    await expect
      .poll(() => imgs.evaluateAll((els) => els.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)))
      .toBe(true)

    await page.keyboard.press('End')
    await expect(picker).toHaveAttribute('aria-activedescendant', 'hero-place-option-all')
    await page.keyboard.press('u')
    await expect(picker).toHaveAttribute('aria-activedescendant', 'hero-place-option-ujjain')
    await page.keyboard.press('Enter')
    await expect(list).toBeHidden()
    await expect(picker).toHaveText('Ujjain')
    await expect(picker).toBeFocused()

    // Escape closes without changing the choice.
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    await expect(picker).toHaveAttribute('aria-expanded', 'false')
    await expect(picker).toHaveText('Ujjain')
  })

  test('city filters update the listing and show every city again', async ({ page }) => {
    await page.goto('/?place=ujjain#cottages')
    await expect(page.locator('#cottages ul').getByRole('article')).toHaveCount(1)
    await page.getByRole('button', { name: 'All cities' }).click()
    await expect(page.locator('#cottages ul').getByRole('article')).toHaveCount(6)
  })

  test('booking form validates and says plainly when requests are not connected', async ({ page }) => {
    test.skip(!!process.env.VITE_FORM_ENDPOINT, 'an endpoint is configured for this build')
    await page.goto('/#book')
    const form = page.locator('#book form')
    await form.getByRole('button', { name: 'Send booking request' }).click()
    await expect(page.locator('#book-place')).toBeFocused()
    await expect(form).toContainText('Choose the city you want to stay in.')
    await expect(form).toContainText('Enter your email address.')

    await page.locator('#book-place').click()
    await page.getByRole('listbox').getByRole('option', { name: /^Nashik/ }).click()
    await page.locator('#book-checkin').fill(nextMonth())
    await page.locator('#book-name').fill('Asha Verma')
    await page.locator('#book-email').fill('asha@example.com')
    await form.getByRole('button', { name: 'Send booking request' }).click()
    await expect(page.getByRole('alert')).toContainText('not connected yet, so nothing was sent')
    await expect(page.locator('#book-name')).toHaveValue('Asha Verma')
  })
})

test.describe('resilience', () => {
  test('content is readable with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    await page.goto('/')
    for (const id of ['cottages-title', 'experiences-title', 'how-title', 'journey-title', 'legend-title', 'day-title', 'questions-title', 'book-title']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expect(page.locator(`#${id}`)).toBeVisible()
      const box = await page.locator(`#${id} [data-reveal]`).boundingBox()
      const parent = await page.locator(`#${id}`).boundingBox()
      expect(Math.abs(box!.y - parent!.y)).toBeLessThan(4)
    }
    await context.close()
  })

  test('prerendered page is complete without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Every twelve years/)
    await expect(page.locator('#legend')).toContainText('Triveni Sangam')
    await expect(page.locator('#cottages')).toContainText('Ganga Kutir')
    const opacity = await page.locator('#how-title [data-reveal]').evaluate((el) => getComputedStyle(el).transform)
    expect(opacity === 'none' || opacity === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
    await context.close()
  })

  test('photos load as responsive AVIF/WebP with alt text', async ({ page }) => {
    await page.goto('/#experiences')
    const img = page.locator('#experiences img').first()
    await expect(img).toHaveAttribute('alt', /Ganga Aarti/)
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    expect(await img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\.(avif|webp)$/)
    const broken = await page.evaluate(async () => {
      const imgs = [...document.querySelectorAll<HTMLImageElement>('main img')]
      const results = await Promise.all(
        imgs.map((el) => fetch(el.currentSrc || el.src, { method: 'HEAD' }).then((r) => (r.ok ? null : el.src))),
      )
      return results.filter(Boolean)
    })
    expect(broken).toEqual([])
  })

  test('falls back to the SVG emblem when 3D is disabled', async ({ page }) => {
    await page.goto('/?no3d')
    await page.waitForTimeout(1500)
    await expect(page.locator('[data-emblem]')).toHaveAttribute('data-emblem', 'svg')
    await expect(page.locator('.hero-emblem canvas')).toHaveCount(0)
  })
})

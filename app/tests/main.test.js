import puppeteer from 'puppeteer'

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
  await page.tracing.start({ path: 'trace.json' })
})

describe('Data profiler homepage', () => {
  test('can load localhost', async done => {
    // console.log('Page:', page)
    try {
      await page.goto('http://localhost:3000', {
        timeout: 3000,
        waitUntil: 'networkidle2'
      })
    } catch (err) {
      console.error('Error:', err)
    }

    const title = await page.title()
    // console.log('Title:', title)
    expect(title).toBe('Data Profiler')

    const fileInput = await page.$('input[type="file"]')
    // console.log('Uploader:', fileInput)

    const SAMPLE_FILE_NAME = 'sample-eq-vol.xlsx'

    await fileInput.uploadFile('../api/' + SAMPLE_FILE_NAME)
    await page.waitFor(1000) // or w/ `waitForNavigation()`

    const tdFilesAfterUpload = await page.$$eval('table tr td', tds =>
      tds.map(td => {
        return td.innerHTML
      })
    )

    // find all sample files
    let found = tdFilesAfterUpload.filter(x => x === SAMPLE_FILE_NAME)

    // check to see if a file was uploaded
    expect(found.length).toBeGreaterThan(0)

    const linkHandlers = await page.$x("//button[contains(text(), 'Del')]")

    if (linkHandlers.length > 0) {
      await linkHandlers[0].click()
    } else {
      console.error('Link not found')
    }

    await page.waitFor(1000) // or w/ `waitForNavigation()`

    const tdFilesAfterDelete = await page.$$eval('table tr td', tds =>
      tds.map(td => {
        return td.innerHTML
      })
    )

    found = tdFilesAfterDelete.filter(x => x === SAMPLE_FILE_NAME)

    // check to see if a file was deleted
    expect(found.length).toEqual(0)

    done()
  }, 5000)

  test.skip('has title "Google"', async () => {
    // console.log('Page:', page)

    await page.goto('https://google.com', { waitUntil: 'networkidle0' })
    const title = await page.title()
    expect(title).toBe('Google')
  })

  afterAll(async () => {
    await browser.close()
  })
})

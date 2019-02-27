import puppeteer from 'puppeteer'

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
  await page.tracing.start({ path: 'trace.json' })
})

describe('Google Homepage', () => {
  test('can load localhost', async () => {
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

    await fileInput.uploadFile('../api/sample-eq-vol.xlsx')

    // await page.waitForNavigation({ waitUntil: 'networkidle2' })

    // const res = await page.$('.table-responsive')
    // console.log('Res:', res)

    const data = await page.$$eval('table tr td', tds =>
      tds.map(td => {
        return td.innerHTML
      })
    )

    console.log(data)

    const found = data.filter(x => x === 'sample-eq-vol.xlsx')

    console.log(found)
  })

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

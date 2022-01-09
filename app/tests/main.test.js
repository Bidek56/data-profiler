import 'expect-puppeteer'

describe('Data profiler homepage', () => {

  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  })

  it('should display "Data Profiler" as title of the page', async () => {   
    const title = await page.title()
    // console.log('Title:', title)
    expect(title).toBe('Data Profiler')
  })

  it('Upload file', async () => {
    const fileInput = await page.$('input[type="file"]')
    // console.log('Uploader:', fileInput)

    const SAMPLE_FILE_NAME = 'financial-sample.xlsx'

    await fileInput.uploadFile('../api/' + SAMPLE_FILE_NAME)
    await page.waitForTimeout(1000) // or w/ `waitForNavigation()`

    const tdFilesAfterUpload = await page.$$eval('table tr td', tds =>
      tds.map(td => {
        return td.innerHTML
      })
    )

    // find all sample files
    let found = tdFilesAfterUpload.filter(x => x === SAMPLE_FILE_NAME)

    // check to see if a file was uploaded
    expect(found.length).toBeGreaterThan(0)

    // console.log("Page:", page);

    const delButtons = await page.$x("//button[contains(., 'Del')]");
    // console.log("delButtons:", delButtons.length);

    if (delButtons.length > 0) {
      await delButtons[0].click()
    } else {
      console.error('Button not found')
    }

    await page.waitForTimeout(1000) // or w/ `waitForNavigation()`

    const tdFilesAfterDelete = await page.$$eval('table tr td', tds =>
      tds.map(td => {
        return td.innerHTML
      })
    );

    found = tdFilesAfterDelete.filter(x => x === SAMPLE_FILE_NAME)

    // check to see if a file was deleted
    expect(found.length).toEqual(0)
  });

});

describe('Google homepage', () => {
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

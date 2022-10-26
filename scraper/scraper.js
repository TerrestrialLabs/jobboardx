// import puppeteer from 'puppeteer'
const puppeteer = require('puppeteer')
// import fs from 'fs/promises'

export async function scrapeJobs() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.indeed.com/jobs?q=React+Developer&l=New+York%2C+NY&fromage=14')
    await page.waitForNavigation()

    // .resultContent > 

    const titles = await page.$$eval('h2.jobTitle', (titles) => {
        return titles.map(x => x.textContent)
    })

    console.log('TITLES: ', titles)

    // await fs.writeFile('jobs.txt', titles.join('\r\n'))

    await browser.close()
}

// scrapeJobs()

// async function startExample() {
//     const browser = await puppeteer.launch()
//     const page = await browser.newPage()
//     await page.goto('https://learnwebcode.github.io/practice-requests/')

//     // Generic function
//     const names = await page.evaluate(() => {
//         return Array.from(document.querySelectorAll('.info strong')).map(x => x.textContent)
//     })
//     await fs.writeFile('names.txt', names.join('\r\n'))

//     await page.click('#clickme')
//     // Selecting single element (instead of documnent.querySelector)
//     const clickedData = await page.$eval('#data', el => el.textContent)
//     console.log('clickedData: ', clickedData)

//     // Selecting multiple elements
//     const photos = await page.$$eval('img', (imgs) => {
//         return imgs.map(x => x.src)
//     })

//     await page.type('#ourfield', 'blue')
//     await Promise.all([
//         page.click('#ourform button'),
//         page.waitForNavigation()
//     ])
//     const info = await page.$eval('#message', el => el.textContent)
//     console.log('info: ', info)

//     for (const photo of photos) {
//         const imgPage = await page.goto(photo)
//         if (imgPage) {
//             const photoPath = photo.split('/')
//             const fileName = photoPath.pop()
//             await fs.writeFile(fileName || '', await imgPage.buffer())
//         }
        
//     }

//     await browser.close()
// }
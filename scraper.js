const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const axios = require('axios')

async function scrapeJobs() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.simplyhired.com/search?q=react+developer')

    await page.screenshot({ path: 'simplyhired.png' })

    const jobs = await page.evaluate(() => {
        let jobList = []

        const convertHourlyToAnnualPay = (pay) => {
            return pay * 40 * 52
        }

        const selection = document.querySelectorAll('.SerpJob-jobCard')

        for (const element of selection) {
            jobList.push({
                // id: element.getAttribute('data-jobkey'),
                title: element.querySelector('.jobposting-title').textContent,
                company: element.querySelector('.jobposting-company').textContent,
                location: element.querySelector('.jobposting-location').textContent.trim(),
                // Placeholders
                salaryMin: 0,
                salaryMax: 0,
                // hourly: false,
                datePosted: element.querySelector('time').textContent,
                applicationLink: 'https://www.simplyhired.com' + element.querySelector('.SerpJob-link').getAttribute('href'),
                description: '',
                companyUrl: 'N/A',
                companyLogo: '' 
            })
        }

        const salaries = document.querySelectorAll('.jobposting-salary')
        let index = 0
        for (const element of salaries) {
            const hourly = element.textContent.includes('hour')
            const salaryArr = element.textContent
                .replace('Estimated: ', '')
                .replace(' a year', '')
                .replace(' an hour', '')
                .replaceAll('$', '')
                .split(' - ')
            const salaryMin = parseInt(salaryArr[0] ? salaryArr[0].replace(',', '') : 0)
            const salaryMax = parseInt(salaryArr[1] ? salaryArr[1].replace(',', '') : 0)

            jobList[index].salaryMin = hourly && salaryArr[0] ? convertHourlyToAnnualPay(salaryArr[0]) : salaryMin
            jobList[index].salaryMax = hourly && salaryArr[1] ? convertHourlyToAnnualPay(salaryArr[1]) : salaryMax
            jobList[index].hourly = hourly

            index += 1
        }

        // Remove jobs that are missing important data
        return jobList
                .filter(item => item.datePosted)
                .filter(item => item.salaryMin || item.salaryMax)
    })

    for (let i = 0; i < jobs.length; i++) {
        const url = jobs[i].applicationLink;
        await page.goto(`${url}`);
        const extraDetails = await page.evaluate(() => {
            let type = document.querySelector('.viewjob-jobType')?.textContent

            if (type && type.includes('Contract')) {
                type = 'contract'
            }

            const logoEl = document.querySelector('.viewjob-company-logoImg')
            const companyLogo = logoEl ? `https://www.simplyhired.com${logoEl.getAttribute('src')}` : ''

            let details = {
                type,
                description: document.querySelector('.viewjob-jobDescription').textContent.replace('Full Job Description', ''),
                skills: Array.from(document.querySelectorAll('.viewjob-qualification')).map(x => x.textContent),
                perks: Array.from(document.querySelectorAll('.viewjob-benefit')).map(x => x.textContent),
                companyLogo
            }

            return details
        })
        jobs[i] = { ...jobs[i], ...extraDetails }
    }

    console.log('jobs: ', jobs)

    await browser.close()

    // Remove jobs that are missing important data
    const jobsToSave = jobs.filter(job => job.type)
    // Write to database
    for (let i = 0; i < jobsToSave.length; i++) {
        try {
            const res = await axios.post('http://localhost:3000/api/jobs', jobsToSave[i])
            console.log(`Saved ${i+1} job${i === 0 ? '' : 's'} to the database`)
            console.log(res.data)
        } catch (err) {
            console.log(err)
        }
    }
}

scrapeJobs()













// async function start() {
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
//         await fs.writeFile(photo.split('/').pop(), await imgPage.buffer())
//     }

//     await browser.close()
// }

// start()
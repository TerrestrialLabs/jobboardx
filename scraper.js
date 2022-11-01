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
                title: element.querySelector('.jobposting-title').textContent.trim(),
                company: element.querySelector('.jobposting-company').textContent.trim(),
                location: element.querySelector('.jobposting-location').textContent.trim(),
                applicationLink: 'https://www.simplyhired.com' + element.querySelector('.SerpJob-link').getAttribute('href'),
                backfilled: true,
                // Placeholders
                salaryMin: 0,
                salaryMax: 0,
                description: '',
                companyUrl: 'N/A',
                companyLogo: '',
                datePosted: element.querySelector('time').textContent
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

            index += 1
        }

        // Remove jobs that are missing important data
        return jobList
                .filter(item => item.datePosted)
                .filter(item => item.salaryMin || item.salaryMax)
    })

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i]
        const url = jobs[i].applicationLink;
        console.log(job.datePosted)
        await page.goto(`${url}`);
        const extraDetails = await page.evaluate((job) => {
            const getPastDate = (daysAgo) => {
                let days = 0
                if (daysAgo === 'Today' || daysAgo.includes('h')) {
                    return new Date()
                }
                if (daysAgo.includes('d')) {
                    const arr = daysAgo.split('d')
                    days = parseInt(arr[0])
                    const date = new Date()
                    return new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
                }
                return new Date()
            }

            let type = document.querySelector('.viewjob-jobType')?.textContent

            if (type && type.includes('Contract')) {
                type = 'contract'
            }

            const logoEl = document.querySelector('.viewjob-company-logoImg')
            const companyLogo = logoEl ? `https://www.simplyhired.com${logoEl.getAttribute('src')}` : ''

            return {
                type,
                description: document.querySelector('[data-testid="VJ-section-content-jobDescription"]').outerHTML,
                skills: Array.from(document.querySelectorAll('.viewjob-qualification')).map(x => x.textContent),
                perks: Array.from(document.querySelectorAll('.viewjob-benefit')).map(x => x.textContent),
                companyLogo,
                datePosted: getPastDate(job.datePosted).toISOString()
            }
        }, job)
        jobs[i] = { ...jobs[i], ...extraDetails }
    }

    await browser.close()

    // Remove jobs that are missing important data
    const jobsToSave = jobs.filter(job => job.type).map(job => ({ ...job, datePosted: new Date(job.datePosted) }))
    console.log("Dates posted: ", jobsToSave.map(job => job.datePosted))
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
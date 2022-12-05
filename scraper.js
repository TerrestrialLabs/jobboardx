const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const axios = require('axios')
const uuid = require('uuid')

async function scrapeJobs(domain) {
    const jobboard = await axios.get(`https://${domain}/api/jobboards/current`)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.simplyhired.com/search?q=react+developer')

    const jobs = await page.evaluate(() => {
        let jobList = []

        const convertHourlyToAnnualPay = (pay) => {
            return pay * 40 * 52
        }

        const selection = document.querySelectorAll('.SerpJob-jobCard')

        for (const element of selection) {
            const location = element.querySelector('.jobposting-location').textContent.trim()
            const remote = location === 'Remote'

            jobList.push({
                title: element.querySelector('.jobposting-title').textContent.trim(),
                company: element.querySelector('.jobposting-company').textContent.trim(),
                location,
                remote,
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

            if (type && type === 'Part-time') {
                type = 'parttime'
            }
            if (type && type === 'Full-time') {
                type = 'fulltime'
            }
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

    const supportedJobTypes = ['fulltime', 'parttime', 'contract']
    // Remove jobs that are missing important data
    const jobsToSave = jobs
        .filter(job => job.type && supportedJobTypes.indexOf(job.type) > -1)
        .map(job => ({ ...job, datePosted: new Date(job.datePosted) }))

    const jobsWithLogo = await Promise.all(
        jobsToSave.map(async job => {
            if (job.companyLogo) {
                const response = await fetch(job.companyLogo)
                const blob = await response.blob()
                const arrayBuffer = await blob.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const base64data = buffer.toString('base64');
                const uploadRes = await uploadToCloudinary(base64data)

                if (uploadRes) {
                    return {
                        ...job,
                        companyLogo: uploadRes
                    }
                }
            }
            return job
        })
    )

    // Write to database
    for (let i = 0; i < jobsWithLogo.length; i++) {
        try {
            const body = {
                ...jobsWithLogo[i],
                email: 'backfill@example.com',
                orderId: uuid.v4(),
                jobboardId: jobboard.data._id
            }
            // const res = await axios.post(`https://${domain}/api/jobs/create-backfilled-job`, body)
            const res = await axios.post(`http://localhost:3000/api/jobs/create-backfilled-job`, body)
            console.log(`Saved ${i+1} job${i === 0 ? '' : 's'} to the database`)
            console.log(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    async function uploadToCloudinary (image) {
        try {
            const response = await fetch(`https://${domain}/api/jobs/upload-image-backfill`, {
                method: 'POST',
                body: image
            })
            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
    }
}

scrapeJobs('www.reactdevjobs.io')
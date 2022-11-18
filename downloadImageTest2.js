const puppeteer = require('puppeteer')
// const fs = require('fs/promises')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const client = require('https')

async function scrapeJobs() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.simplyhired.com/search?q=react+developer')

    const jobs = await page.evaluate(() => {
        let jobList = []

        const selection = document.querySelectorAll('.SerpJob-jobCard')

        for (const element of selection) {
            jobList.push({
                company: element.querySelector('.jobposting-company').textContent.trim(),
                applicationLink: 'https://www.simplyhired.com' + element.querySelector('.SerpJob-link').getAttribute('href'),
                companyLogo: ''
            })
        }

        return jobList
    })

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i]
        const url = jobs[i].applicationLink;
        await page.goto(`${url}`);
        const extraDetails = await page.evaluate(async (job) => {
            const logoEl = document.querySelector('.viewjob-company-logoImg')
            const companyLogo = logoEl ? `https://www.simplyhired.com${logoEl.getAttribute('src')}` : ''
            return {
                companyLogo
            }
        }, job)
        jobs[i] = { ...jobs[i], ...extraDetails }
    }

    await browser.close()

    let jobsToSave = jobs.filter(job => job.companyLogo)

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

    async function uploadToCloudinary (image) {
        try {
            const response = await fetch('http://localhost:3000/api/jobs/upload-image-backfill', {
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

// TO DO: Delete tempLogoImages after scraping jobs

scrapeJobs()
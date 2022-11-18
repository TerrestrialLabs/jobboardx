const puppeteer = require('puppeteer')
// const fs = require('fs/promises')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const client = require('https')

async function scrapeJobs() {
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.goto('https://www.simplyhired.com/search?q=react+developer')

    // const jobs = await page.evaluate(() => {
    //     let jobList = []

    //     const selection = document.querySelectorAll('.SerpJob-jobCard')

    //     for (const element of selection) {
    //         jobList.push({
    //             company: element.querySelector('.jobposting-company').textContent.trim(),
    //             applicationLink: 'https://www.simplyhired.com' + element.querySelector('.SerpJob-link').getAttribute('href'),
    //             companyLogo: ''
    //         })
    //     }

    //     return jobList
    // })

    // for (let i = 0; i < jobs.length; i++) {
    //     const job = jobs[i]
    //     const url = jobs[i].applicationLink;
    //     await page.goto(`${url}`);
    //     const extraDetails = await page.evaluate(async (job) => {
    //         const logoEl = document.querySelector('.viewjob-company-logoImg')
    //         const companyLogo = logoEl ? `https://www.simplyhired.com${logoEl.getAttribute('src')}` : ''
    //         return {
    //             companyLogo
    //         }
    //     }, job)
    //     jobs[i] = { ...jobs[i], ...extraDetails }
    // }

    // await browser.close()

    // const jobsToSave = jobs.filter(job => job.companyLogo)

    // UNCOMMENT THE ABOVE

    // console.log('jobsToSave: ', jobsToSave)
    // console.log("Jobs saved: ", jobsToSave.length)

    // jobsToSave.forEach(async (job, index) => {
    //     // Download images if !!companyLogo
    //     if (job.companyLogo) {
    //         const response = await fetch(job.companyLogo)
    //         const blob = await response.blob()
    //         const arrayBuffer = await blob.arrayBuffer()
    //         const buffer = Buffer.from(arrayBuffer)
    //         // await fs.writeFile(`./tempLogoImages/${job.company}.jpeg`, buffer)
    //         await fs.writeFile(`./tempLogoImages/company_${index}.jpeg`, buffer)
    //     }
    // })

    const dir = './tempLogoImages2'
    const files = await fs.promises.readdir(dir)

    async function uploadToCloudinary () {
        for(const fileName of files) {
            const filePath = path.join(__dirname, `./tempLogoImages2/${fileName}`)
            const image = await fs.promises.readFile(filePath)
            const base64data = image.toString('base64');

            fetch('http://localhost:3000/api/jobs/upload-image-backfill', {
                method: 'POST',
                body: base64data
            }).then(res => {
                const resJson = res.json()
                // console.log('RESPONSE: ', resJson)
            }).catch(err => console.log(err))
            .finally(() => console.log('Finished'))
        }
    }

    await uploadToCloudinary()
}

scrapeJobs()
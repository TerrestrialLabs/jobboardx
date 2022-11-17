const puppeteer = require('puppeteer')
const fs = require('fs/promises')
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

    const jobsToSave = jobs.filter(job => job.companyLogo)
    console.log('jobsToSave: ', jobsToSave)

    jobsToSave.forEach(job => {
        // Download images if !!companyLogo
    })
}

scrapeJobs()

function downloadImage(url, name){
    fetch(url)
      .then(resp => resp.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // the filename you want
          a.download = name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('An error sorry'));
}
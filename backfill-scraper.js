const puppeteer = require('puppeteer')
const axios = require('axios')
const uuid = require('uuid')
const fetch = require('node-fetch')
require('dotenv').config()

async function scrapeJobs(jobboard) {
    const { data: existingJobs } = await axios.get(`https://www.jobboardx.io/api/jobs/backfilled?jobboardId=${jobboard._id}`)
    const applicationLinks = existingJobs.map(job => job.applicationLink)

    let jobs = []
    let pageNum = 1
    let endOfResults = false
    const numJobsToScrape = 40

    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()

    while (endOfResults === false) {
        if (jobs.length < numJobsToScrape) {
            await page.goto(`https://www.simplyhired.com/search?q=${jobboard.searchQuery}&pn=${pageNum}`)

            const results = await page.evaluate(() => {
                let jobList = []
        
                const convertHourlyToAnnualPay = (pay) => {
                    return pay * 40 * 52
                }

                const convertWeeklyToAnnualPay = (pay) => {
                    return pay * 1000
                }
        
                const selection = document.querySelectorAll("[data-testid='searchSerpJob']")

                for (const element of selection) {
                    const location = element.querySelector("[data-testid='searchSerpJobLocation']").textContent.trim()
                    const remote = location === 'Remote'
                    const dateStamp = element.querySelector("[data-testid='searchSerpJobDateStamp']")

                    jobList.push({
                        title: element.querySelector("[data-testid='searchSerpJobTitle']").textContent.trim(),
                        company: element.querySelector("[data-testid='companyName']").textContent.trim(),
                        location,
                        remote,
                        applicationLink: 'https://www.simplyhired.com' + element.querySelector("[data-testid='searchSerpJobTitle']").querySelector('a').getAttribute('href'),
                        backfilled: true,
                        // Placeholders
                        salaryMin: 0,
                        salaryMax: 0,
                        description: '',
                        companyUrl: 'N/A',
                        companyLogo: '',
                        datePosted: dateStamp ? element.querySelector("[data-testid='searchSerpJobDateStamp']").textContent : ''
                    })
                }
        
                const salaries = document.querySelectorAll("[data-testid='searchSerpJobSalaryEst']")
                let index = 0
                for (const element of salaries) {
                    const hourly = element.textContent.includes('hour')
                    const weekly = element.textContent.includes('week')
                    let salaryStr = element.textContent
                    if (element.textContent.includes('.') && element.textContent.includes('K')) {
                        salaryStr = salaryStr
                            .replace('.', ',')
                            .replace('K', '00')
                            .replace('.', ',')
                            .replace('K', '00')
                    }
                    const salaryArr = salaryStr
                        .replace('Estimated: ', '')
                        .replace(' a year', '')
                        .replace(' a week', '')
                        .replace(' an hour', '')
                        .replace('K', ',000')
                        .replace('K', ',000')
                        .replaceAll('$', '')
                        .split(' - ')
                    const salaryMin = parseInt(salaryArr[0] ? salaryArr[0].replace(',', '') : 0)
                    const salaryMax = parseInt(salaryArr[1] ? salaryArr[1].replace(',', '') : 0)
        
                    jobList[index].salaryMin = salaryMin
                    if (hourly && salaryArr[0]) {
                        jobList[index].salaryMin = convertHourlyToAnnualPay(salaryArr[0])
                    } else if (weekly && salaryArr[0]) {
                        jobList[index].salaryMin = convertWeeklyToAnnualPay(salaryArr[0])
                    }

                    jobList[index].salaryMax = salaryMax
                    if (hourly && salaryArr[1]) {
                        jobList[index].salaryMax = convertHourlyToAnnualPay(salaryArr[1])
                    } else if (weekly && salaryArr[1]) {
                        jobList[index].salaryMax = convertWeeklyToAnnualPay(salaryArr[1])
                    }

                    index += 1
                }
        
                // Remove jobs that are missing important data
                jobList = jobList
                        .filter(item => item.datePosted)
                        .filter(item => item.salaryMin || item.salaryMax)

                const nextButton = document.querySelectorAll("[aria-label='next page']")

                return {
                    jobs: jobList,
                    hasNextButton: nextButton.length > 0
                }
            })

            jobs = jobs.concat(results.jobs)

            if (results.hasNextButton) {
                // Go to next page
                pageNum += 1
            } else {
                // Stop searching - TO DO: Move onto next keyword
                endOfResults = true
            }
        } else {
            endOfResults = true
        }
    }

    // Job has not been backfilled already
    const newJobs = jobs.filter(item => !applicationLinks.includes(item.applicationLink))

    for (let i = 0; i < newJobs.length; i++) {
        const job = newJobs[i]
        const url = newJobs[i].applicationLink;

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

            const detailEls = [...document.querySelectorAll("[data-testid='detailText']")]
            let type = ''
            detailEls.forEach(el => {
                const detailText = el.textContent
                let isType = detailText.includes('Part-time') || detailText.includes('Full-time') || detailText.includes('Contract')
                if (isType && detailText === 'Part-time') {
                    type = 'parttime'
                }
                if (isType && detailText === 'Full-time') {
                    type = 'fulltime'
                }
                if (isType && detailText.includes('Contract')) {
                    type = 'contract'
                }
            })

            const logoEl = document.querySelector("[data-testid='companyVJLogo']")
            const companyLogo = logoEl ? `https://www.simplyhired.com${logoEl.getAttribute('src')}` : ''

            const skills = document.querySelector('[data-testid="viewJobQualificationsContainer"]')
            const perks = document.querySelector('[data-testid="viewJobBodyJobBenefits"]')

            return {
                type,
                description: document.querySelector('[data-testid="viewJobBodyJobFullDescriptionContent"]').outerHTML,
                skills: skills ? Array.from(skills.querySelectorAll('li')).map(x => x.textContent.trim()) : [],
                perks: perks ? Array.from(perks.querySelectorAll('li')).map(x => x.textContent.trim()) : [],
                companyLogo,
                datePosted: getPastDate(job.datePosted).toISOString()
            }
        }, job)
        newJobs[i] = { ...newJobs[i], ...extraDetails }
    }

    await browser.close()

    const supportedJobTypes = ['fulltime', 'parttime', 'contract']
    // Remove jobs that are missing important data
    const jobsToSave = newJobs
        .filter(job => job.type && supportedJobTypes.indexOf(job.type) > -1)
        .filter(job => !!job.companyLogo)
        .map(job => ({ ...job, datePosted: new Date(job.datePosted) }))

    const jobsWithLogo = await Promise.all(
        jobsToSave.map(async job => {
            const response = await fetch(job.companyLogo)
            const blob = await response.blob()
            const arrayBuffer = await blob.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const base64data = buffer.toString('base64');

            return {
                jobData: {
                    ...job,
                    email: 'no-reply@example.com',
                    orderId: uuid.v4(),
                    jobboardId: jobboard._id
                },
                image: base64data
            }
        })
    )

    let savedJobs = []
    for (let i = 0; i < jobsWithLogo.length; i++) { 
        try {
            const res = await axios.post(`https://www.jobboardx.io/api/jobs/backfill`, jobsWithLogo[i], {
                headers: {
                    'Authorization': `Bearer ${process.env.ACTIONS_SECRET}`
                }
            })
            savedJobs.push(res.data)
            console.log(`Job ${i}: Success: ${res.data._id}`)
        } catch (err) {
            console.log(`Job ${i}: Error: ${err}`)
        }
    }

    console.log('Jobs saved: ', savedJobs.length)

    if (savedJobs.length > 0) {
        // Tweet the last backfilled job if no employer jobs posted in the last 24 hours
        const recentJobsRes = await axios.get(`https://www.jobboardx.io/api/jobs/latest-count?jobboardId=${jobboard._id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.ACTIONS_SECRET}`
            }
        })

        console.log('Jobs posted in the last 24 hr: ', recentJobsRes.data.jobCount)

        if (recentJobsRes.data && recentJobsRes.data.jobCount === 0) {
            try {
                const jobToTweet = savedJobs[savedJobs.length - 1]
                delete jobToTweet.description
    
                await axios.post(`https://www.jobboardx.io/api/twitter/tweet`, { job: jobToTweet, jobboardId: jobboard._id, domain: jobboard.domain, twitterHashtags: jobboard.twitterHashtags }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.ACTIONS_SECRET}`
                    }
                })
                console.log('Tweet successful')
            } catch (err) {
                console.log('Tweet failed: ', err)
            }
        }
    }
}

async function scrapeJobsForAllBoards() {
    const { data: jobboards } = await axios.get(`https://www.jobboardx.io/api/jobboards`)
    jobboards.forEach(board => {
        scrapeJobs(board)
    })
}

scrapeJobsForAllBoards()
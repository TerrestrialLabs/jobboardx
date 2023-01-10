import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job, { JobData } from '../../../models/Job'
import cloudinary from 'cloudinary'
import BackfilledEmployer from '../../../models/BackfilledEmployer'
import { ROLE } from '../../../const/const'

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData | JobData[] | boolean>
) {
    const { method } = req

    dbConnect()

    if (method === 'POST') {
        try {
            if (req.headers.authorization) {
                const token = req.headers.authorization.replace('Bearer', '').trim()
                if (token !== process.env.ACTIONS_SECRET) {
                    throw Error('Unauthorized')
                }
            } else {
                throw Error('Unauthorized')
            }

            const job = req.body.jobData

            if (!job.applicationLink.startsWith('https://www.simplyhired.com')) {
                throw Error('Invalid request')
            }

            const existingJob = await Job.findOne({ applicationLink: job.applicationLink, backfilled: true }).exec()
            const clientCompany = await Job.findOne({ company: job.company, backfilled: false })
            // We've already scraped this job
            if (existingJob) {
                throw Error('This job already exists')
            }
            // Fail if scraped job company has a real job posting
            if (clientCompany) {
                throw Error('This company already exists')
            }

            // Upload logo
            let logo
            var dataURI = 'data:image/jpeg;base64,' + req.body.image
            if (dataURI) {
                logo = await cloudinary.v2.uploader.upload(dataURI, { folder: 'logos' }, (error, result) => { console.log(result, error) })
            }
            
            const newJob = await Job.create({
                ...job,
                companyLogo: logo?.url ? logo.url : '',
                backfilled: true,
                datePosted: job.datePosted ? job.datePosted : new Date()
            })
            // For some reason we get an error even though we're doing this after creating job
            // delete job.orderId

            // Create backfilled placeholder company
            const backfilledEmployer = await BackfilledEmployer.findOne({ 'employer.company': job.company })
            if (!backfilledEmployer) {
                await BackfilledEmployer.create({
                    jobboardId: newJob.jobboardId,
                    email: 'no-reply@example.com',
                    role: ROLE.EMPLOYER,
                    employer: {
                        company: newJob.company,
                        website: newJob.companyUrl,
                        logo: newJob.companyLogo
                    }
                })
            }

            res.status(201).json(newJob)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
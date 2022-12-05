import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'

export type JobData = {
    _id: string
    jobboardId: string
    backfilled: boolean
    createdAt: Date
    datePosted: Date
    title: string
    company: string
    companyUrl: string
    companyLogo: string
    type: string
    location: string
    remote: boolean
    skills: string[]
    perks: string[]
    featured: boolean
    applicationLink: string,
    description: string
    salaryMin: number
    salaryMax: number
}

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
            const existingJob = await Job.findOne({ applicationLink: req.body.applicationLink, backfilled: true }).exec()
            const clientCompany = await Job.findOne({ company: req.body.company, backfilled: false })
            // We've already scraped this job
            if (existingJob) {
                throw Error('This job already exists')
            }
            // Fail if scraped job company has a real job posting
            if (clientCompany) {
                throw Error('This company already exists')
            }

            if (!req.body.applicationLink.startsWith('https://www.simplyhired.com')) {
                throw Error('Invalid request')
            }

            const job = await Job.create({
                ...req.body,
                backfilled: true,
                datePosted: req.body.datePosted ? req.body.datePosted : new Date()
            })

            // For some reason we get an error even though we're doing this after creating job
            // delete job.email
            // delete job.orderId

            res.status(201).json(job)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
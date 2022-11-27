import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'

export type JobData = {
    _id: string
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
    res: NextApiResponse<JobData>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    // TO DO: We don't want email field
    if (method === 'GET') {
        const job = await Job.findById(id).select('-email').select('-orderId')
        // TO DO
        // @ts-ignore
        res.status(200).json(job)
    }
}
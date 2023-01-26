import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job, { JobData } from '../../../models/Job'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData | JobData[] | boolean | string>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        const days = 31
        const currentDate = new Date()
        const sinceDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000))

        try {
            const jobs = await Job.find({
                jobboardId: req.query.jobboardId,
                backfilled: true,
                datePosted: { $gte: sinceDate }
            })
                .select('applicationLink').select('datePosted').select('createdAt')
                .sort({ 'datePosted': -1, 'createdAt': -1 })
                .limit(100)
                .exec() 
            res.status(200).json(jobs)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
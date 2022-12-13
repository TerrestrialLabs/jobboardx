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
    res: NextApiResponse<JobData>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'GET') {
        const job = await Job.findById(id).select('-orderId')
        // TO DO
        // @ts-ignore
        res.status(200).json(job)
    }
}
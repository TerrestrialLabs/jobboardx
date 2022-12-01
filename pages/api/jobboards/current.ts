import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import JobBoard from '../../../models/JobBoard'
import type { JobBoardData } from './index'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobBoardData>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'GET') {
        // Hardcode default job board for local development
        const url = req.headers.host?.includes('localhost') ? 'www.reactdevjobs.io' : req.headers.host
        const jobboard = await JobBoard.findOne({ url }).select('-email')
        // @ts-ignore
        res.status(200).json(jobboard)
    }
}
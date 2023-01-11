import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import JobBoard from '../../../models/JobBoard'
import type { JobBoardData } from './index'
import { getSession } from '../../../api/getSession'
import { ROLE } from '../../../const/const'

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
        method
    } = req

    dbConnect()

    if (method === 'GET') {
        try {
            // Hardcode default job board for local development
            // TO DO: Save default domain in env var
            const domain = req.headers.host?.includes('localhost') ? 'www.reactdevjobs.io' : req.headers.host
            const jobboard = await JobBoard.findOne({ domain }).select('-email').select('-searchQuery')
            // @ts-ignore
            res.status(200).json(jobboard)
        } catch (err) {
            console.log('err: ', err)
        }
    }
}
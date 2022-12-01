import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import JobBoard from '../../../models/JobBoard'

export type JobBoardData = {
    _id: string
    createdAt: Date
    title: string
    url: string
    email: string
    homeTitle: string
    homeSubtitle: string
    heroImage: string
    skills: string[]
}

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

    // TO DO: We don't want email field
    if (method === 'GET') {
        const job = await JobBoard.findOne({ email: '' }).select('-email')
        // TO DO
        // @ts-ignore
        res.status(200).json(job)
    }
}
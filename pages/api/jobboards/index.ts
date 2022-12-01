import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobBoard from '../../../models/JobBoard'

export type JobBoardData = {
    _id: string
    createdAt: Date
    title: string
    domain: string
    company: string
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
    const { method } = req

    dbConnect()
    
    if (method === 'POST') {
        try {
            const jobboard = await JobBoard.create(req.body)
            res.status(201).json(jobboard)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
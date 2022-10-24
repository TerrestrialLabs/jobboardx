import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'

export type JobData = {
    _id: string
    createdAt: Date
    title: string
    company: string
    companyUrl: string
    type: string
    location: string
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

    if (method === 'GET') {
        const job = await Job.findById(id)
        // TO DO
        // @ts-ignore
        res.status(200).json(job)
    }

    if (method === 'PUT') {
        try {
            const job = await Job.create(req.body)
            res.status(201).json(job)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'DELETE') {
        try {
            const job = await Job.create(req.body)
            res.status(201).json(job)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
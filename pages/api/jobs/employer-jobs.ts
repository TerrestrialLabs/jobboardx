import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import { getSession } from 'next-auth/react'
import { JobData } from './index'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData[]>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            // const jobs = await Job.find({ employerId: session?.user?.id }).exec()
            const jobs = await Job.find().exec()
            res.status(200).json(jobs)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
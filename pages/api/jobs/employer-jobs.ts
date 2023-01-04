import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job, { JobData } from '../../../models/Job'
import { getSession } from '../../../api/getSession'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData[] | boolean>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // @ts-ignore
            const jobs = await Job.find({ employerId: session?.user?._id }).sort({ 'datePosted': -1 }).exec()
            res.status(200).json(jobs)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'PUT') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // @ts-ignore
            await Job.updateMany({ employerId: session?.user?._id }, { $set: req.body }).exec()

            res.status(200).json(true)
        } catch (err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
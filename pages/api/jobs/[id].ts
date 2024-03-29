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
    res: NextApiResponse<JobData | boolean | string>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const job = await Job.findById(id).select('-orderId')
            if (!job) {
                return res.status(404).json(getErrorMessage('Not found'))
            } else {
                // @ts-ignore
                return res.status(200).json(job)
            }
        } catch (err) {
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'DELETE') {
        try {
            const session = await getSession({ req })
            const job = await Job.findById(id)
            // @ts-ignore
            if (session && session?.user?._id && job.employerId === session.user._id) {
                await Job.deleteOne({ _id: job._id })
                res.status(200).json(true)
            } else {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
        } catch (err) {
        // @ts-ignore
        res.status(500).json(getErrorMessage(err))
        }
    }
}
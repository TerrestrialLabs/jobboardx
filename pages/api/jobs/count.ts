import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import { getFilters } from './index'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<number>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        const filters = getFilters(req.query)

        try {
            const count = await Job.countDocuments(filters).exec()
            res.status(200).json(count)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
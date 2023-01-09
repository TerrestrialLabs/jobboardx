import type { NextApiRequest, NextApiResponse } from 'next'
import Job from '../../../models/Job'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const bearerToken = req.headers.authorization

        if (bearerToken) {
            const token = bearerToken.replace('Bearer', '').trim()

            if (process.env.ACTIONS_SECRET === token) {
                const currentDate = new Date()
                const sinceDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

                const filters = {
                    jobboardId: req.query.jobboardId,
                    backfilled: false,
                    datePosted: { $gte: sinceDate }
                }

                const count = await Job.countDocuments(filters).exec()

                res.status(200).json({ count })
            } else {
                throw Error('Unauthorized')
            }
        } else {
            throw Error('Unauthorized')
        }
    } catch(err) {
        // @ts-ignore
        res.status(500).json(getErrorMessage(err))
    }
}

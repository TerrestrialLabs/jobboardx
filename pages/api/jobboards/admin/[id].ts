import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../mongodb/dbconnect'
import Job from '../../../../models/Job'
import JobBoard from '../../../../models/JobBoard'
import type { JobBoardData } from '../index'
import { getSession } from '../../../../api/getSession'
import { ROLE } from '../../../../const/const'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobBoardData | string>
) {
    const { 
        method
    } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // TO DO: Only jobboard creator admin should be able to update this
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN)) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // @ts-ignore
            const jobboard = await JobBoard.findOne({ _id: req.query.id, ownerId: session.user._id })

            if (!jobboard) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }

            res.status(200).json(jobboard)
        } catch (err) {
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'PUT') {
        try {
            const session = await getSession({ req })
            // TO DO: Only jobboard creator admin should be able to update this
            // @ts-ignore
            if (!session?.user || session?.user?.role !== ROLE.ADMIN) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // @ts-ignore
            const jobboardToUpdate = await JobBoard.findOne({ _id: req.query.id, ownerId: session.user._id })

            if (!jobboardToUpdate) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }

            const jobboard = await JobBoard.findOneAndUpdate({ _id: jobboardToUpdate._id }, { $set : req.body }).select('-email')
            // @ts-ignore
            res.status(200).json(jobboard)
        } catch (err) {
            res.status(500).json(getErrorMessage(err))
        }
    }
}
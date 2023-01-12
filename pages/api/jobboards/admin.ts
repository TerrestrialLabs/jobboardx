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
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // Hardcode default job board for local development
            // TO DO: Save default domain in env var
            const domain = req.headers.host?.includes('localhost') ? process.env.DEFAULT_BOARD_URL : req.headers.host
            const jobboard = await JobBoard.findOne({ domain })
            // @ts-ignore
            res.status(200).json(jobboard)
        } catch (err) {
            console.log('err: ', err)
        }
    }

    if (method === 'PUT') {
        try {
            const session = await getSession({ req })
            // TO DO: Only jobboard creator admin should be able to update this
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            // Hardcode default job board for local development
            // TO DO: Save default domain in env var
            const domain = req.headers.host?.includes('localhost') ? process.env.DEFAULT_BOARD_URL : req.headers.host

            const jobboardToUpdate = await JobBoard.findOne({ domain })
            // @ts-ignore
            if (jobboardToUpdate.ownerId !== session.user._id) {
                throw Error('Unauthorized')
            }

            const jobboard = await JobBoard.findOneAndUpdate({ domain }, { $set : req.body }).select('-email')
            // @ts-ignore
            res.status(200).json(jobboard)
        } catch (err) {
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'POST') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }

            // @ts-ignore
            const jobboard = await JobBoard.create({ ...req.body, email: session.user.email, ownerId: session.user._id })

            res.status(201).json(jobboard)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
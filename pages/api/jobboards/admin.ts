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
    res: NextApiResponse<JobBoardData[] | string>
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
            const jobboards = await JobBoard.find({ ownerId: session.user._id })

            res.status(200).json(jobboards)
        } catch (err) {
            console.log('err: ', err)
        }
    }

    if (method === 'POST') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN)) {
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
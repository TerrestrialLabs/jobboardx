import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import { getSession } from '../../../api/getSession'
import { ROLE } from '../../../const/const'
import TwitterKey from '../../../models/TwitterKey'
import JobBoard from '../../../models/JobBoard'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<boolean | string>
) {
    const { 
        method
    } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            
            const jobboard = await JobBoard.findOne({ _id: req.query.jobboardId })
            // @ts-ignore
            if (jobboard.ownerId !== session.user._id) {
                throw Error('Unauthorized')
            }

            const keys = await TwitterKey.findOne({ jobboardId: req.query.jobboardId })
            
            res.status(200).json(!!keys)
        } catch (err) {
            console.log('err: ', err)
        }
    }

    if (method === 'POST') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }
            
            const jobboard = await JobBoard.findOne({ _id: req.body.jobboardId })
            // @ts-ignore
            if (jobboard.ownerId !== session.user._id) {
                throw Error('Unauthorized')
            }

            await TwitterKey.create(req.body)

            res.status(201).json(true)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }

    if (method === 'DELETE') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }

            const jobboard = await JobBoard.findOne({ _id: req.query.jobboardId })
            // @ts-ignore
            if (jobboard.ownerId !== session.user._id) {
                throw Error('Unauthorized')
            }

            await TwitterKey.deleteOne({ jobboardId: req.query.jobboardId })

            res.status(200).json(true)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
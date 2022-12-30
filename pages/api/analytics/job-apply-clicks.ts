import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import UserEvent from '../../../models/UserEvent'
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
    res: NextApiResponse<boolean>
) {
    const { method } = req

    dbConnect()
    
    if (method === 'POST') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            const user = session?.user
            // @ts-ignore
            if (!user || (user?.role !== ROLE.EMPLOYER && user?.role !== ROLE.ADMIN && user?.role !== ROLE.SUPERADMIN)) {
                const ipAddress = req.headers['x-forwarded-for']  || req.socket.remoteAddress

                await UserEvent.create({
                    jobboardId: req.body.jobboardId,
                    jobId: req.body.jobId,
                    type: 'job-view',
                    ipAddress
                })
            }

            const ipAddress = req.headers['x-forwarded-for']  || req.socket.remoteAddress

            await UserEvent.create({
                jobboardId: req.body.jobboardId,
                jobId: req.body.jobId,
                type: 'job-apply-click',
                subtype: req.body.subtype,
                ipAddress
            })
            
            res.status(201).json(true)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
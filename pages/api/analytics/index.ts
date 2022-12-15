import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import UserEvent from '../../../models/UserEvent'
import { getSession } from 'next-auth/react'
import Job from '../../../models/Job'

export type UserEventType = {
    jobboardId: string
    type: string
    subtype?: string
    jobId: string
    ipAddress: string
}

export type AnalticsStatsType = {
    jobs: number
    views: number
    emailApplyClicks: number
    urlApplyClicks: number
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AnalticsStatsType>
) {
    const { method } = req

    dbConnect()
    
    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (session && session?.user?._id) {
                // @ts-ignore
                const jobIds = await Job.find({ employerId: session.user._id }).distinct('_id')
                const events = await UserEvent.find({ jobId: {$in: jobIds }})
                
                res.status(200).json({
                    jobs: jobIds.length,
                    views: events.filter(event => event.type === 'job-view').length,
                    emailApplyClicks: events.filter(event => event.type === 'job-apply-click').filter(event => event.subtype === 'email').length,
                    urlApplyClicks: events.filter(event => event.type === 'job-apply-click').filter(event => event.subtype === 'url').length,
                })
            } else {
                // @ts-ignore
                throw Error('Unauthorized')
            }
        } catch (err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
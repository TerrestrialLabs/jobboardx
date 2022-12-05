import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Subscription from '../../../models/Subscription'

export type SubscriptionData = {
    _id: string,
    jobboardId: string
    email: string
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SubscriptionData | boolean>
) {
    const { method } = req

    dbConnect()
    
    if (method === 'POST') {
        try {
            const existingSubscription = await Subscription.findOne({ jobboardId: req.body.jobboardId, email: req.body.email }).exec()
            if (!existingSubscription) {
                await Subscription.create(req.body)
            }
            res.status(201).json(true)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
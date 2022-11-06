import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Subscription from '../../../models/Subscription'

export type SubscriptionData = {
    _id: string,
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
            const existingSubscription = await Subscription.findOne({ email: req.body.email }).exec()
            if (existingSubscription) {
                throw Error('This subscription already exists')
            }
            const subscription = await Subscription.create(req.body)
            res.status(201).json(subscription)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
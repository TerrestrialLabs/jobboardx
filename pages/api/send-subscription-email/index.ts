import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Subscription from '../../../models/Subscription'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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
            const subscriptions = await Subscription.find().exec()
            const message = {
                to: subscriptions.map(subscription => subscription.email),
                from: 'support@reactdevjobs.io',
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            }
            await sgMail.sendMultiple(message)
            console.log('Subscription emails sent')
            res.status(201).json(true)
        } catch(err) {
            // TO DO
            console.log('err: ', err)
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
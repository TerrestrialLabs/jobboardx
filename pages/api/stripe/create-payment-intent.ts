import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from 'uuid'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async (req: NextApiRequest, res: NextApiResponse<{ clientSecret: string, paymentIntentId: string }>) => {
    const { method } = req

    if (method === 'POST') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                ...req.body,
                metadata: {
                    orderId: uuidv4()
                }
            })
            
            res.status(201).json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            })
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
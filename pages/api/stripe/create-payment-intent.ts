import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export default async (req: NextApiRequest, res: NextApiResponse<string>) => {
    const { method } = req

    if (method === 'POST') {
        try {
            const paymentIntent = await stripe.paymentIntents.create(req.body)
            
            res.status(201).json(paymentIntent.client_secret)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
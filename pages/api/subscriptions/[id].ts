import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Subscription from '../../../models/Subscription'

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
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'DELETE') {
        try {
            await Subscription.deleteOne({ _id: id })
            res.status(200).json(true)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
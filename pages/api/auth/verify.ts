import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import jwt from 'jsonwebtoken'

dbConnect()

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
        const headersToken = req.headers.authorization

        if (headersToken) {
            let userSession
            jwt.verify(headersToken, process.env.ACCESS_TOKEN_SECRET as string, (err, session) => {
                if (err) { 
                    throw Error('Unauthorized') 
                } else {
                    userSession = session
                }
            })
            res.status(200).json(userSession)
        } else {
            throw Error('Unauthorized') 
        }
    } catch (err) {
        res.status(500).json(getErrorMessage(err))
    }
}

export const isExpired = (expiration: Date) => {
    const currentDate = new Date()
    const expirationDate = new Date(expiration)
    return currentDate > expirationDate
}
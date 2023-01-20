import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import jwt from 'jsonwebtoken'
import { generateAccessToken } from '../../../api/token'
import { checkIsAdminSite } from '../../../api/checkIsAdminSite'

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
        // TO DO: Duplicate code in refresh endpoint
        const { cookies } = req

        const isAdminSite = checkIsAdminSite(req)
        const cookie = isAdminSite ? cookies.jobboardx_dashboard : cookies.jobboardx

        if (cookie) {
            const parsedCookie = JSON.parse(cookie)
            const refreshToken = parsedCookie.refreshToken
            let newAccessToken, user

            // @ts-ignore
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, session) => {
                if (err) { 
                    console.log("Error verifying token")
                } else {
                    // @ts-ignore
                    user = session?.user
                    newAccessToken = generateAccessToken(user)
                }
            })

            res.status(200).json({ accessToken: newAccessToken, user })
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
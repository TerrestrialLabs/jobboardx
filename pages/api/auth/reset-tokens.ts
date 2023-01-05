import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, serializeCookie } from '../../../api/token'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
        const { body, cookies } = req

        if (cookies.jobboardx) {
            const parsedCookie = JSON.parse(cookies.jobboardx)
            const refreshToken = parsedCookie.refreshToken
            let newAccessToken, newRefreshToken

            // @ts-ignore
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err) => {
                if (err) {
                    res.setHeader('Set-Cookie', cookie.serialize('jobboardx', '', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== 'development',
                        expires: new Date(0),
                        // TO DO: Check
                        // sameSite: 'strict',
                        path: '/'
                    }))
                } else {
                    // @ts-ignore
                    newAccessToken = generateAccessToken(body)
                    newRefreshToken = generateRefreshToken(body)
                    
                    res.setHeader('Set-Cookie', serializeCookie(newRefreshToken))
                    res.status(200).json({ accessToken: newAccessToken })
                }
            })
        } else {
            throw Error('Unauthenticated')
        }
    } catch (err) {
        console.log('err: ', err)
    }
}
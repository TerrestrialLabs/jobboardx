import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, serializeCookie } from '../../../api/token'
import { checkIsAdminSite } from '../../../api/checkIsAdminSite'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
        const { body, cookies } = req

        const isAdminSite = checkIsAdminSite(req)
        const siteCookie = isAdminSite ? cookies.jobboardx_dashboard : cookies.jobboardx
        const cookieName = `jobboardx${isAdminSite ? '_dashboard' : ''}`

        if (siteCookie) {
            const parsedCookie = JSON.parse(siteCookie)
            const refreshToken = parsedCookie.refreshToken
            let newAccessToken, newRefreshToken

            // @ts-ignore
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err) => {
                if (err) {
                    res.setHeader('Set-Cookie', cookie.serialize(cookieName, '', {
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
                    
                    res.setHeader('Set-Cookie', serializeCookie(newRefreshToken, isAdminSite))
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
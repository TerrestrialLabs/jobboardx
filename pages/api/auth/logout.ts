import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import cookie from 'cookie'
import { checkIsAdminSite } from '../../../api/checkIsAdminSite'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
        const isAdminSite = checkIsAdminSite(req)
        const cookieName = `jobboardx${isAdminSite ? '_dashboard' : ''}`

        res.setHeader('Set-Cookie', cookie.serialize(cookieName, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            expires: new Date(0),
            // TO DO: Check
            // sameSite: 'strict',
            path: '/'
        }))

        res.status(200).json(true)
    } catch (err) {
        console.log('err: ', err)
    }
}
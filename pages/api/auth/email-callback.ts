import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import VerificationToken from '../../../models/VerificationToken'
import dbConnect from '../../../mongodb/dbconnect'
import { generateAccessToken, generateRefreshToken, serializeCookie } from '../../../api/token'
import { getUserForSession } from '../../../api/getSession'
import { checkIsAdminSite } from '../../../api/checkIsAdminSite'

dbConnect()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
        const isAdminSite = checkIsAdminSite(req)

        // Check for necessary body params
        if (!req.body.callbackUrl || !req.body.token || !req.body.email) {
            throw Error('Invalid')
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            throw Error('An account with this email could not be found')
        }

        const token = await VerificationToken.findOne({ token: req.body.token })

        if (!token) {
            throw Error('Invalid')
        }
        if (isExpired(token)) {
            await VerificationToken.deleteOne({ _id: token._id })
            throw Error('Invalid')
        }

        const authenticatedUser = await User.findOneAndUpdate({ _id: user._id }, { $set: { emailVerified: new Date() } }, { new: true })
        const sessionUser = getUserForSession(authenticatedUser)

        const accessToken = generateAccessToken(sessionUser)
        const refreshToken = generateRefreshToken(sessionUser)

        if (!accessToken || !refreshToken) {
            throw Error('Invalid')
        }

        await VerificationToken.deleteOne({ _id: token._id })

        res.setHeader('Set-Cookie', serializeCookie(refreshToken, isAdminSite))

        res.status(200).json({ accessToken, user: authenticatedUser })
    } catch (err) {
        res.redirect('/login-error')
    }
}

export const isExpired = (expiration: Date) => {
    const currentDate = new Date()
    const expirationDate = new Date(expiration)
    return currentDate > expirationDate
}
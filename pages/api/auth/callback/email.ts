import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../../models/User'
import VerificationToken from '../../../../models/VerificationToken'
import dbConnect from '../../../../mongodb/dbconnect'
import jwt from 'jsonwebtoken'

dbConnect()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    dbConnect()

    try {
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

        const authenticatedUser = await User.findOneAndUpdate({ _id: user._id }, { $set: { emailVerified: new Date() } })

        const jwtToken = jwt.sign({ user: authenticatedUser }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
        if (!jwtToken) {
            throw Error('Invalid')
        }

        await VerificationToken.deleteOne({ _id: token._id })

        res.status(200).json({ jwtToken, user: authenticatedUser })
    } catch (err) {
        res.redirect('/login-error')
    }
}

export const isExpired = (expiration: Date) => {
    const currentDate = new Date()
    const expirationDate = new Date(expiration)
    return currentDate > expirationDate
}
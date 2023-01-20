import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../mongodb/dbconnect'
import User from '../../../../models/User'
import { ROLE } from '../../../../const/const'
import JobBoard from '../../../../models/JobBoard'

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
    const { 
        method
    } = req

    dbConnect()

    // TO DO: Temporarily disabled
    return

    if (method === 'POST') {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                throw Error('A user with this email address already exists.')
            }

            const admin = {
                email: req.body.email,
                role: ROLE.ADMIN
            }

            const newAdmin = await User.create(admin)

            res.status(201).json(newAdmin)
        } catch (err) {
            res.status(500).json(getErrorMessage(err))
        }
    }
}
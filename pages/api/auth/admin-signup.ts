import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import User from '../../../models/User'
import { ROLE } from '../../../const/const'
import JobBoard from '../../../models/JobBoard'

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

    if (method === 'POST') {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                throw Error('A user with this email address already exists.')
            }

            const domain = req.headers.host?.includes('localhost') ? 'www.reactdevjobs.io' : req.headers.host
            const jobboard = await JobBoard.findOne({ domain }).select('-email')

            const admin = await User.create({
                jobboardId: jobboard._id,
                email: req.body.email,
                role: ROLE.ADMIN
            })

            // const admin = {
            //     jobboardId: null,
            //     email: req.body.email,
            //     role: ROLE.SUPERADMIN
            // }

            const newAdmin = await User.create(admin)

            res.status(201).json(newAdmin)
        } catch (err) {
            console.log('err: ', err)
        }
    }
}
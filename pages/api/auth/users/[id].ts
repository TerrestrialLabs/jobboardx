import type { NextApiRequest, NextApiResponse } from 'next'
import User, { UserType } from '../../../../models/User'
import dbConnect from '../../../../mongodb/dbconnect'
import { getSession } from '../../../../api/getSession'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserType>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || session.user._id !== id) {
                throw Error('Unauthorized')
            }
            const user = await User.findOne({ _id: id }).exec()
            res.status(200).json(user)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
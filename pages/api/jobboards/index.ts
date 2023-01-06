import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobBoard from '../../../models/JobBoard'
import { getSession } from '../../../api/getSession'
import { ROLE } from '../../../const/const'

export type JobBoardData = {
    _id: string
    createdAt: Date
    title: string
    domain: string
    company: string
    email: string
    homeTitle: string
    homeSubtitle: string
    heroImage: string
    logoImage: string
    skills: string[]
    priceFeatured: number
    priceRegular: number
    searchQuery: string
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobBoardData | JobBoardData[]>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const jobboards = await JobBoard.find()
            res.status(200).json(jobboards)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
    
    if (method === 'POST') {
        try {
            const session = await getSession({ req })
            // @ts-ignore
            if (!session?.user || (session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)) {
                // @ts-ignore
                return res.status(401).json(getErrorMessage('Unauthorized'))
            }

            // @ts-ignore
            const jobboard = await JobBoard.create({ ...req.body, email: session.user.email })

            res.status(201).json(jobboard)
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
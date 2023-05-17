import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import { JobData } from '../../../models/Job'
import User from '../../../models/User'
import { ROLE } from '../../../const/const'
import BackfilledEmployer from '../../../models/BackfilledEmployer'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData | JobData[] | boolean>
) {
    const { method } = req

    dbConnect()

    if (method === 'GET') {
        try {
            const employers = await User.find({
                jobboardId: req.query.jobboardId,
                role: ROLE.EMPLOYER
            }).select('-email').select('-employer.billingAddress').exec()

            const backfilledEmployers = await BackfilledEmployer.find({
                jobboardId: req.query.jobboardId
            }).select('-email').exec()

            const allEmployers = employers.concat(backfilledEmployers).sort((a, b) => { 
                if (a.employer.company.toLowerCase() < b.employer.company.toLowerCase()) {
                    return -1
                } else if (a.employer.company.toLowerCase() > b.employer.company.toLowerCase()) {
                    return 1
                } else {
                    return 0
                }
            })

            res.status(200).json(allEmployers)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
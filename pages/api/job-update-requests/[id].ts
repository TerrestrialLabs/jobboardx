import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobUpdateRequest from '../../../models/JobUpdateRequest'
import type { JobUpdateRequestData } from './index'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobUpdateRequestData>
) {
    const { 
        method,
        query: { id }
    } = req

    dbConnect()

    if (method === 'GET') {
        const jobUpdateRequest = await JobUpdateRequest.findById(id)
        // TO DO
        // @ts-ignore
        res.status(200).json(jobUpdateRequest)
    }
}
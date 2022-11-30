import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Event from '../../../models/Event'
import type { NextRequest } from 'next/server'

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<boolean>
) {
    const { method } = req

    dbConnect()
    
    if (method === 'POST') {
        try {
            const ipAddress = req.headers['x-forwarded-for']  || req.socket.remoteAddress

            console.log('req.headers: ', req.headers)

            const res = await Event.create({
                event: 'job-view',
                ipAddress
            })
            
            console.log('Event logged: ', res.type)
            res.status(201).json(true)
        } catch(err) {
            console.log('There was an error sending the email: ', err)
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
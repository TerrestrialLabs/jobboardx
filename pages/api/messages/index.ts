import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import sgMail from '@sendgrid/mail'
import Message from '../../../models/Message'
import JobBoard from '../../../models/JobBoard'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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
            const domain = req.headers.host?.includes('localhost') ? 'www.reactdevjobs.io' : req.headers.host
            const jobboard = await JobBoard.findOne({ domain }).select('-ownerId').exec()

            await Message.create({ ...req.body, jobboardId: jobboard._id })

            const message = {
                to: jobboard.email,
                from: `${jobboard.title} <${jobboard.email}>`,
                subject: `Message | ${req.body.category}`,
                html: 
                    `<html>
                        <body>
                            <div>
                                <p><strong>Sender: </strong>${req.body.email}</p>
                                <p><strong>Message: </strong></p>
                            </div>
                            <div>${req.body.message.split('\n\n').map((line: string) => `<p>${line}</p>`).join('')}</div>
                        </body>
                    </html>`
            }

            await sgMail.send(message)

            res.status(201).json(true)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
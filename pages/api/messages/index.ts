import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobUpdateRequest from '../../../models/JobUpdateRequest'
import * as nodemailer from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer'
import Job from '../../../models/Job'
import Message from '../../../models/Message'

export type JobUpdateRequestData = {
    _id: string,
    jobId: string,
    email: string
}

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
            await Message.create(req.body)

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'support@reactdevjobs.io',
                    pass: process.env.GOOGLE_APP_PASSWORD
                }
            })

            const mailOptions = {
                // TO DO: How to show sender's email?
                from: 'React Jobs <support@reactdevjobs.io>',
                to: 'React Jobs <support@reactdevjobs.io>',
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

            transporter.sendMail(mailOptions, (err: Error | null, res: SentMessageInfo) => {
                if (err) {
                    console.log('There was an error sending the contact email: ', err)
                } else {
                    console.log('Contact email sent.')
                }
            })

            res.status(201).json(true)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
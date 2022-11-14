import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobUpdateRequest from '../../../models/JobUpdateRequest'
import * as nodemailer from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer'

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
            const jobUpdateRequest = await JobUpdateRequest.create(req.body)

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'support@reactdevjobs.io',
                  pass: process.env.GOOGLE_APP_PASSWORD
                }
            })

            const link = `http://localhost:3000/jobs/edit/${jobUpdateRequest._id}`
            const mailOptions = {
                from: 'React Jobs <support@reactdevjobs.io>',
                to: req.body.email,
                subject: 'Your job update request',
                html: 
                    `<html>
                        <body>
                            <p>Please use this link to update your job posting: <a href="${link}">${link}</a>.</p>
                            <p>This link will only be valid for 24 hours. If it expires, request another one from the job posting page.</p>
                        </body>
                    </html>`
            }

            transporter.sendMail(mailOptions, (err: Error | null, res: SentMessageInfo) => {
                if (err) {
                    console.log('There was an error sending the email: ', err)
                } else {
                    console.log('Job update request email sent.')
                }
            })

            res.status(201).json(jobUpdateRequest)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
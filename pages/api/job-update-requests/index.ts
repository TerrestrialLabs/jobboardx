import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobUpdateRequest from '../../../models/JobUpdateRequest'
import * as nodemailer from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer'
import Job from '../../../models/Job'
import { BASE_URL, TYPE_MAP } from '../../../const/const'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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
            const job = await Job.findOne({ _id: req.body.jobId })

            if (job.email === req.body.email) {
                const jobUpdateRequest = await JobUpdateRequest.create(req.body)

                const message = {
                    to: job.email,
                    from: 'React Jobs <support@reactdevjobs.io>',
                    html: "<html></html>",
                    dynamic_template_data: {
                        subject: 'Job posting update request',
                        job: {
                            postType: job.featured ? 'Featured' : 'Regular',
                            type: TYPE_MAP[job.type],
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            salaryMin: job.salaryMin,
                            salaryMax: job.salaryMax,
                            companyLogo: job.companyLogo ? job.companyLogo : null,
                            companyLogoPlaceholder: job.company.slice(0, 1).toUpperCase(),
                            url: `${BASE_URL}jobs/${job._id}`
                        },
                        updateUrl: `${BASE_URL}jobs/edit/${jobUpdateRequest._id}`
                    },
                    template_id: 'd-1f886db2ebbd4ac49ca882112b80eeea'
                }

                await sgMail.send(message)
                console.log('Job update request email sent.')
            }
            res.status(201).json(true)
        } catch(err) {
            console.log('There was an error sending the email: ', err)
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
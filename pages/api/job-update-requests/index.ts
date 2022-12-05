import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import JobUpdateRequest from '../../../models/JobUpdateRequest'
import Job from '../../../models/Job'
import { TYPE_MAP } from '../../../const/const'
import sgMail from '@sendgrid/mail'
import { formatSalaryRange } from '../../../utils/utils'
import JobBoard from '../../../models/JobBoard'

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
            const domain = req.headers.host?.includes('localhost') ? 'www.reactdevjobs.io' : req.headers.host
            const jobboard = await JobBoard.findOne({ domain })
            const job = await Job.findOne({ _id: req.body.jobId })

            if (job.email === req.body.email) {
                const jobUpdateRequest = await JobUpdateRequest.create(req.body)

                const message = {
                    to: job.email,
                    from: `${jobboard.title} <${jobboard.email}>`,
                    html: "<html></html>",
                    dynamic_template_data: {
                        subject: 'Job posting update request',
                        job: {
                            postType: job.featured ? 'Featured' : 'Regular',
                            type: TYPE_MAP[job.type],
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            salaryRange: formatSalaryRange(job.salaryMin, job.salaryMax),
                            companyLogo: job.companyLogo ? job.companyLogo : null,
                            companyLogoPlaceholder: job.company.slice(0, 1).toUpperCase(),
                            url: `https://${jobboard.domain}/jobs/${job._id}`
                        },
                        updateUrl: `https://${jobboard.domain}/jobs/edit/${jobUpdateRequest._id}`
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
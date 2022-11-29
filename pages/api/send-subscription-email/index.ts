import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Subscription from '../../../models/Subscription'
import sgMail from '@sendgrid/mail'
import Job from '../../../models/Job'
import SubscriptionEmail from '../../../models/SubscriptionEmail'
import { BASE_URL } from '../../../const/const'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export type SubscriptionData = {
    _id: string,
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
    res: NextApiResponse<SubscriptionData | boolean>
) {
    const { method } = req

    dbConnect()

    // TO DO: Split up into batches of 1,000 emails
    // TO DO: Only send new jobs since last email/week >= timestamp of last sent job (save in DB collection)
    if (method === 'POST') {
        try {
            const subscriptions = await Subscription.find().exec()

            if (!subscriptions.length) {
                res.status(201).json(true)
                return
            }

            const currentDate = new Date()
            const sinceDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
            const lastSubscriptionEmail = await SubscriptionEmail.find().sort({ createdAt: -1 }).limit(1)
            const lastEmailDate = lastSubscriptionEmail.length ? lastSubscriptionEmail[0].createdAt : sinceDate

            // await SubscriptionEmail.create({})

            const fetchLimit = 13
            const jobs = await Job.find({ datePosted: { $gte: lastEmailDate } })
                .select('-email')
                .sort({ 'featured': -1, 'backfilled': 1, 'datePosted': -1 })
                .limit(fetchLimit)

            const messages = subscriptions.map(subscription => ({
                to: subscription.email,
                from: 'React Jobs <support@reactdevjobs.io>',
                html: "<html></html>",
                dynamic_template_data: {
                    subject: "New React jobs for you",
                    jobs: jobs.slice(0, 12).map(job => ({
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        companyLogo: job.companyLogo ? job.companyLogo : null,
                        companyLogoPlaceholder: job.company.slice(0, 1).toUpperCase(),
                        url: `${BASE_URL}${job._id}`
                    })),
                    numJobs: jobs.length === fetchLimit ? `${fetchLimit - 1}+'` : jobs.length,
                    timeStamp: currentDate,
                    dateFormat: "MMMM D, YYYY",
                    unsubscribeUrl: `${BASE_URL}unsubscribe/${subscription._id}`
                },
                template_id: 'd-2b27defb433c4a7e99667df4ed069625'
            }))

            // SendGrid can send up to 1000 emails at a time
            const chunkSize = 1000;
            for (let i = 0; i < messages.length; i += chunkSize) {
                const chunk = messages.slice(i, i + chunkSize);
                await sgMail.send(chunk)
                console.log('Subscription emails sent')
            }

            res.status(201).json(true)
        } catch(err) {
            // TO DO
            console.log('err: ', err)
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
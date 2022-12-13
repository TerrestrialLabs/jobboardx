import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'
import Job, { JobData } from '../../../models/Job'
import dbConnect from '../../../mongodb/dbconnect'
import sgMail from '@sendgrid/mail'
import { PRICE, TYPE_MAP } from '../../../const/const'
import { add, format } from 'date-fns'
import { formatSalaryRange } from '../../../utils/utils'
import JobBoard from '../../../models/JobBoard'
import { getSession } from 'next-auth/react'
import User, { UserType } from '../../../models/User'

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

dbConnect()

const storage = multer.memoryStorage()
const upload = multer({ storage }) // TO DO: Check here for file size
const singleUpload = upload.single('image')

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export const createOrUpdateJob = nextConnect<NextApiRequest, NextApiResponse>()

createOrUpdateJob.use(singleUpload)

createOrUpdateJob.post(async (req, res) => {
    const jobData = JSON.parse(req.body['jobData'])
    const stripePaymentIntentId = req.body['stripePaymentIntentId']
    const mode = req.body['mode']

    let dataURI
    // @ts-ignore
    if (req.file) {
        // @ts-ignore
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        // @ts-ignore
        dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    }

    try {
        const session = await getSession({ req })

        // @ts-ignore
        if (!session || !session.user || session.user.id !== jobData.employerId) {
            throw Error('Not authenticated')
        }
        
        const employer = await User.findOne({ email: session.user.email }) as UserType

        // 1. Check for payment (create job)
        let orderId
        if (mode === 'create') {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
            const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
            // Make sure no other job has been created with the same orderId
            const jobsWithSameOrderId = await Job.find({ orderId: paymentIntent.metadata.orderId }).exec()

            if (!paymentIntent || jobsWithSameOrderId.length > 0 || paymentIntent.status !== 'succeeded') {
                throw Error('Invalid transaction')
            }
            orderId = paymentIntent.metadata.orderId
        }

        // 2. Upload logo image
        let cloudinaryRes, 
            cloudinaryUrl = jobData.companyLogo
        // New logo image has been attached to req
        if (dataURI) {
            cloudinaryRes = await cloudinary.v2.uploader.upload(dataURI, { folder: 'react-dev-jobs' }, (error, result) => { 
                if (error) {
                    throw Error('Failed to upload logo, please try again.')
                }
            })
        }
        if (cloudinaryRes) {
            cloudinaryUrl = cloudinaryRes.url
        }
        jobData.companyLogo = cloudinaryUrl

        // 3. Create or update job
        if (mode === 'create') {
            const job = await Job.create({
                ...jobData,
                company: employer.company,
                companyUrl: employer.website,
                companyLogo: employer.logo,
                datePosted: req.body.datePosted ? req.body.datePosted : new Date(),
                orderId
            })
            delete job.orderId

            await sendConfirmationEmail({ host: req.headers.host, job, mode, email: session.user.email as string })

            res.status(201).json(job)
        } else if (mode === 'update') {
            const job = await Job.findOneAndUpdate(
                { _id: jobData._id }, 
                {
                    ...jobData,
                    company: employer.company,
                    companyUrl: employer.website,
                    companyLogo: employer.logo 
                }, 
                { new: true }
            ).select('-orderId')

            await sendConfirmationEmail({ host: req.headers.host, job, mode, email: session.user.email as string })

            res.status(200).json(job)
        }
    } catch(err) {
        // TO DO
        // @ts-ignore
        res.status(500).json(getErrorMessage(err))
    }
})

export const config = {
    api: {
        bodyParser: false // Disallow body parsing, consume as stream
    }
}

export default createOrUpdateJob

type SendConfirmationEmailParams = {
    host: string | undefined
    job: JobData & { email: string },
    mode: string
    email: string
}
export const sendConfirmationEmail = async ({ host, job, mode, email }: SendConfirmationEmailParams) => {
    try {
        const domain = host?.includes('localhost') ? 'www.reactdevjobs.io' : host
        const jobboard = await JobBoard.findOne({ domain })

        const startDate = job.datePosted
        const endDate = add(startDate, { days: 30 })
        const message = {
            to: email,
            from: `${jobboard.title} <${jobboard.email}>`,
            html: "<html></html>",
            dynamic_template_data: {
                subject: `Your job has been ${mode === 'create' ? 'posted' : 'updated'}`,
                jobboard: {
                    domain: jobboard.domain,
                    title: jobboard.title
                },
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
                price: job.featured ? PRICE.featured : PRICE.regular,
                startDate: format(startDate, 'MMM. d, yyyy'),
                endDate: format(endDate, 'MMM. d, yyyy')
            },
            template_id: mode === 'create' ? 'd-5dbc7dfe9f7c43608b56fa9b5800b363' : 'd-d3b3ae5b86364b20b449921da615506e'
        }

        const res = await sgMail.send(message)
        if (res[0] && res[0].statusCode === 202) {
            console.log('Confirmation email sent')
            return res
        }
    } catch (err) {
        throw Error('Failed to send confirmation email.')
    }
}
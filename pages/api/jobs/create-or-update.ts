import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'
import Job, { JobData } from '../../../models/Job'
import dbConnect from '../../../mongodb/dbconnect'
import sgMail from '@sendgrid/mail'
import { TYPE_MAP } from '../../../const/const'
import { add, format } from 'date-fns'
import { formatSalaryRange } from '../../../utils/utils'
import JobBoard from '../../../models/JobBoard'
import { getSession } from '../../../api/getSession'
import User, { Employer, UserType } from '../../../models/User'
import { getNewPositionTweet } from '../../../utils/twitter'
import TwitterKey from '../../../models/TwitterKey'
import { TwitterApi } from 'twitter-api-v2'

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

    try {
        const session = await getSession({ req })

        // @ts-ignore
        if (!session || !session.user || session.user._id !== jobData.employerId) {
            // @ts-ignore
            return res.status(401).json(getErrorMessage('Unauthorized'))
        }
        
        // @ts-ignore
        const user = await User.findOne({ email: session.user.email }) as Employer

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

        // 2. Create or update job
        if (mode === 'create') {
            const job = await Job.create({
                ...jobData,
                company: user.employer.company,
                companyUrl: user.employer.website,
                companyLogo: user.employer.logo,
                datePosted: req.body.datePosted ? req.body.datePosted : new Date(),
                orderId
            })
            delete job.orderId

            // @ts-ignore
            await sendConfirmationEmail({ host: req.headers.host, job, mode, email: session.user.email as string })

            tweet({ host: req.headers.host, job, jobboardId: jobData.jobboardId })

            res.status(201).json(job)
        } else if (mode === 'update') {
            const job = await Job.findOneAndUpdate(
                { _id: jobData._id }, 
                {
                    ...jobData,
                    company: user.employer.company,
                    companyUrl: user.employer.website,
                    companyLogo: user.employer.logo 
                }, 
                { new: true }
            ).select('-orderId')

            // @ts-ignore
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
        const jobboard = await JobBoard.findOne({ domain }).select('-ownerId').exec()

        const startDate = job.datePosted
        const endDate = add(startDate, { days: 30 })
        const price = job.featured ? jobboard.priceFeatured : jobboard.priceRegular
        const formattedStartDate = format(startDate, 'MMM. d, yyyy')
        const formattedEndDate = format(endDate, 'MMM. d, yyyy')
        const subject = `Your job has been ${mode === 'create' ? 'posted' : 'updated'}`
        const postType = job.featured ? 'Featured' : 'Regular'
        const type = TYPE_MAP[job.type]
        const salaryRange = formatSalaryRange(job.salaryMin, job.salaryMax)
        const url = `https://${jobboard.domain}/jobs/${job._id}`
        const message = {
            to: email,
            from: `${jobboard.title} <${jobboard.email}>`,
            html: "<html></html>",
            text: `${jobboard.title}\n\n${subject}\n\nPost type: ${postType}\nPrice: ${price}\nStart date: ${formattedStartDate}\nEnd date: ${formattedEndDate}\nJob type: ${type}\nJob title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${salaryRange}\n${url}`,
            dynamic_template_data: {
                subject,
                jobboard: {
                    domain: jobboard.domain,
                    title: jobboard.title
                },
                job: {
                    postType,
                    type,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    salaryRange,
                    companyLogo: job.companyLogo ? job.companyLogo : null,
                    companyLogoPlaceholder: job.company.slice(0, 1).toUpperCase(),
                    url
                },
                price,
                startDate: formattedStartDate,
                endDate: formattedEndDate
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

type TweetParams = {
    host: string | undefined
    job: JobData
    jobboardId: string
}
export const tweet = async ({ host, job, jobboardId }: TweetParams) => {
    const domain = host?.includes('localhost') ? 'www.reactdevjobs.io' : host
    const jobboard = await JobBoard.findOne({ domain }).select('-ownerId').exec()
    const postUrl = `https://${jobboard.domain}/jobs/${job._id}`
    const text = getNewPositionTweet({ job, postUrl })
    
    try {
        const keys = await TwitterKey.findOne({ jobboardId })
        const client = new TwitterApi({
            appKey: keys.apiKey,
            appSecret: keys.apiKeySecret,
            accessToken: keys.accessToken,
            accessSecret: keys.accessTokenSecret
        })
        const twitterClient = client.readWrite

        const res = await twitterClient.v2.tweet(text)
        console.log('Twitter res: ', res)
    } catch (err) {
        console.log('Twitter err: ', err)
    }
}
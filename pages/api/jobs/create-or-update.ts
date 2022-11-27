import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'
import Job from '../../../models/Job'
import JobUpdateRequest from '../../../models/JobUpdateRequest'

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

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
    const updateToken = req.body['updateToken']

    let dataURI
    // @ts-ignore
    if (req.file) {
        // @ts-ignore
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        // @ts-ignore
        dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    }

    try {
        let orderId
        if (mode === 'create') {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
            const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
            // Make sure no other job has been created with the same orderId
            const jobWithSameOrderId = await Job.find({ orderId: paymentIntent.metadata.orderId })

            if (!paymentIntent || jobWithSameOrderId.length > 0 || paymentIntent.status !== 'succeeded') {
                throw Error('Invalid transaction')
            }
            orderId = paymentIntent.metadata.orderId
        }

        // 1. Check for valid update token 
        if (mode === 'update') {
            const tokenRes = await JobUpdateRequest.findById(updateToken)
            if (!tokenRes || tokenRes.jobId !== jobData._id) {
                throw Error('Invalid or expired update token.')
            }
            const hours = 24
            const validDuration = hours * 60 * 60 * 1000
            const currentDate = new Date()
            const createdDate = new Date(tokenRes.createdAt)
            const expirationDate = new Date(createdDate.getTime() + validDuration)
            // TO DO: Expire after use
            const expired = currentDate >= expirationDate
            if (expired) {
                throw Error('Invalid or expired update token.')
            }    
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
                datePosted: req.body.datePosted ? req.body.datePosted : new Date(),
                orderId
            })
            delete job.orderId

            res.status(201).json(job)
        } else if (mode === 'update') {
            const job = await Job.findOneAndUpdate({ _id: jobData._id }, jobData, { new: true })
                .select('-email')
                .select('-orderId')
                
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
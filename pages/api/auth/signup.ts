import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'
import dbConnect from '../../../mongodb/dbconnect'
import sgMail from '@sendgrid/mail'
import User from '../../../models/User'

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

export const signUp = nextConnect<NextApiRequest, NextApiResponse>()

signUp.use(singleUpload)

signUp.post(async (req, res) => {
    const employerData = JSON.parse(req.body['employerData'])

    let dataURI
    // @ts-ignore
    if (req.file) {
        // @ts-ignore
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        // @ts-ignore
        dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    }

    try {
        // TO DO
        // 1. Check if account exists (unique email, company)
        const user = await User.findOne({ email: employerData.email, company: employerData.company })
        if (user) {
            throw Error('A company with this name or email address already exists.')
        }

        // 2. Upload logo image
        let cloudinaryRes, 
            cloudinaryUrl = employerData.logo
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
        employerData.logo = cloudinaryUrl

        // 3. Create account

        const employer = await User.create({
            ...employerData,
            role: 'employer'
        })

        // await sendConfirmationEmail({ host: req.headers.host, job, mode })

        res.status(201).json(employer)

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

export default signUp
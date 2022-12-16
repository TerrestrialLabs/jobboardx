import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'
import dbConnect from '../../../mongodb/dbconnect'
import sgMail from '@sendgrid/mail'
import User from '../../../models/User'
import { getSession } from 'next-auth/react'
import axios from 'axios'
import { ROLE } from '../../../const/const'

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

signUp.put(async (req, res) => {
    const userData = JSON.parse(req.body['userData'])

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
        if (!session?.user || userData._id !== session?.user._id) {
            throw Error('Unauthorized')
        }

        // 1. Check if account exists (unique email, company)
        const user = await User.findOne({ email: userData.email, 'employer.company': userData.employer.company })
        // @ts-ignore
        if (user && user._id.toString() !== session?.user._id) {
            throw Error('A company with this name or email address already exists.')
        }

        // 2. Upload logo image
        let cloudinaryRes, 
            cloudinaryUrl = userData.employer.logo
        // New logo image has been attached to req
        if (dataURI) {
            cloudinaryRes = await cloudinary.v2.uploader.upload(dataURI, { folder: 'react-dev-jobs' }, (error, result) => { 
                if (error) {
                    throw Error('Failed to upload logo, please try again.')
                }
            })
            if (cloudinaryRes) {
                cloudinaryUrl = cloudinaryRes.url
            }
        }
        userData.employer.logo = cloudinaryUrl

        // 3. Create account
        const employer = await User.findOneAndUpdate(
            // @ts-ignore
            { _id: session?.user._id }, 
            {
                ...userData,
                role: ROLE.EMPLOYER,
                admin: null
            }, 
            { new: true })

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
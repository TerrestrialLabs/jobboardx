import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'
import nextConnect from 'next-connect'
import multer from 'multer'

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

export const uploadLogo = nextConnect<NextApiRequest, NextApiResponse>()

uploadLogo.use(singleUpload)

uploadLogo.post(async (req, res) => {
    // @ts-ignore
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    // @ts-ignore
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    try {
        const response = await cloudinary.v2.uploader.upload(dataURI, { folder: 'react-dev-jobs' }, (error, result) => { console.log(result, error) })
        res.status(201).json(response.url)
    } catch(err) {
        // TO DO
        // @ts-ignore
        res.status(500).json(getErrorMessage(err))
    }

    res.status(200).json({ data: 'success' })
})

export const config = {
    api: {
        bodyParser: false // Disallow body parsing, consume as stream
    }
}

export default uploadLogo
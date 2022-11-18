import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from 'cloudinary'

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
    const { method } = req

    if (method == 'POST') {
        var dataURI = 'data:image/jpeg;base64,' + req.body;

        try {
            const response = await cloudinary.v2.uploader.upload(dataURI, { folder: 'react-dev-jobs' }, (error, result) => { console.log(result, error) })
            res.status(201).json(response.url)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
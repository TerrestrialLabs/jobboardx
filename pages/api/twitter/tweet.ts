import type { NextApiRequest, NextApiResponse } from 'next'
import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY as string,
    appSecret: process.env.TWITTER_API_KEY_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string
})

const bearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string)

const twitterClient = client.readWrite
const twitterBearer = bearer.readOnly

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    if (method === 'POST') {
        try {
            const bearerToken = req.headers.authorization

            if (bearerToken) {
                const token = bearerToken.replace('Bearer', '').trim()

                if (process.env.ACTIONS_SECRET === token) {
                    await twitterClient.v2.tweet(req.body.text)

                    res.status(201).json(true)
                } else {
                    throw Error('Unauthorized')
                }
            } else {
                throw Error('Unauthorized')
            }
        } catch(err) {
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
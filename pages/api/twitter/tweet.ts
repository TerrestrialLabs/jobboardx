import type { NextApiRequest, NextApiResponse } from 'next'
import { twitterClient } from '../../../api/twitterConfig'
import JobBoard from '../../../models/JobBoard'
import { getNewPositionTweet } from '../../../utils/twitter'
// import { TwitterApi } from 'twitter-api-v2'

// const client = new TwitterApi({
//     appKey: process.env.TWITTER_API_KEY as string,
//     appSecret: process.env.TWITTER_API_KEY_SECRET as string,
//     accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
//     accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string
// })

// const bearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string)

// const twitterClient = client.readWrite
// const twitterBearer = bearer.readOnly

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
    try {
        const bearerToken = req.headers.authorization

        if (bearerToken) {
            const token = bearerToken.replace('Bearer', '').trim()

            if (process.env.ACTIONS_SECRET === token) {
                const domain = req.headers.host
                const jobboard = await JobBoard.findOne({ domain })
                const postUrl = `https://${jobboard.domain}/jobs/${req.body.job._id}`
                const text = getNewPositionTweet({ job: req.body.job, postUrl })

                await twitterClient.v2.tweet(text)

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

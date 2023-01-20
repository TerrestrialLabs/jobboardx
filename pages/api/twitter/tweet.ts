import type { NextApiRequest, NextApiResponse } from 'next'
import { TwitterApi } from 'twitter-api-v2'
import TwitterKey from '../../../models/TwitterKey'
import { getNewPositionTweet } from '../../../utils/twitter'

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
                const postUrl = `https://${req.body.domain}/jobs/${req.body.job._id}`
                const text = getNewPositionTweet({ job: req.body.job, postUrl })

                try {
                    const keys = await TwitterKey.findOne({ jobboardId: req.body.jobboardId })
                    const client = new TwitterApi({
                        appKey: keys.apiKey,
                        appSecret: keys.apiKeySecret,
                        accessToken: keys.accessToken,
                        accessSecret: keys.accessTokenSecret
                    })
                    const twitterClient = client.readWrite

                    await twitterClient.v2.tweet(text)
                } catch (err) {
                    throw Error('Tweet failed')
                }

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

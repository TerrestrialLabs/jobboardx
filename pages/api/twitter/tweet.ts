import type { NextApiRequest, NextApiResponse } from 'next'
import { twitterClient } from '../../../api/twitterConfig'
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
                const domain = req.headers.host
                const postUrl = `https://${domain}/jobs/${req.body.job._id}`
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

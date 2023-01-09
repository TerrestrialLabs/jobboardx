import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY as string,
    appSecret: process.env.TWITTER_API_KEY_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string
})

const bearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string)

export const twitterClient = client.readWrite
export const twitterBearer = bearer.readOnly
import { JobData } from "../models/Job"

type GetNewPositionTweetParams = {
    job: JobData
    postUrl: string
    twitterHashtags: string[]
}
export const getNewPositionTweet = ({ job, postUrl, twitterHashtags = [] }: GetNewPositionTweetParams) => {
    const fullyRemote = job.location.toLowerCase() === 'remote'
    // TO DO: Randomize
    const numHashtags = 3
    const hashtags = twitterHashtags.slice(0, numHashtags).map(hashtag => `#${hashtag}`).join(' ')

    return `New position at ${job.company}!\n\n🦸🦸🏿‍♀️ ${job.title}\n🌎 ${job.location === 'remote' ? 'Remote' : job.location}${(fullyRemote || !job.remote) ? '' : ' - Remote'}\n\nCheck it out:\n${postUrl}\n\n${hashtags}`
}
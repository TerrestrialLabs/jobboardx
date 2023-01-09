import { JobData } from "../models/Job"

export const getNewPositionTweet = ({ job, postUrl }: { job: JobData, postUrl: string }) => {
    const fullyRemote = job.location.toLowerCase() === 'remote'
    return `New position at ${job.company}!\n\n🦸🦸🏿‍♀️ ${job.title}\n🌎 ${job.location === 'remote' ? 'Remote' : job.location}${fullyRemote ? '' : ' - Remote'}\n\nCheck it out:\n${postUrl}\n\n#react #javascript #jobs`
}
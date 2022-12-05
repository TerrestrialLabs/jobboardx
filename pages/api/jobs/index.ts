import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'

type Filters = { 
    [key: string ]: 
        string | 
        number | 
        { $gte: number } | 
        ({ title: { $regex: RegExp } } | { company: { $regex: RegExp; }; })[] |
        ({ datePosted: { $gte: Date } } | { createdAt: { $gte: Date; }; })[] 
}

export type JobData = {
    _id: string
    jobboardId: string
    backfilled: boolean
    createdAt: Date
    datePosted: Date
    title: string
    company: string
    companyUrl: string
    companyLogo: string
    type: string
    location: string
    remote: boolean
    skills: string[]
    perks: string[]
    featured: boolean
    applicationLink: string,
    description: string
    salaryMin: number
    salaryMax: number
}

export const getFilters = (query: NextApiRequest['query']) => {
    delete query.pageIndex

    const days = 31 // For last 4 days
    const currentDate = new Date()
    const sinceDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000))

    // TO DO: Ignore casing for filters

    // TO DO
    // @ts-ignore
    const filters: Filters = {
        jobboardId: query.jobboardId as string,
        ...(query.type ? { type: query.type } : {}),
        ...(query.location 
            ? ((query.location as string).toLowerCase() === 'remote' ? { remote: true } : { location: query.location }) 
            : {}),
        // Only past 30 days listings
        ...({ datePosted: { $gte: sinceDate } }),
        // Make sure job's max salary is at least equal to min salary requirement
        ...(query.salaryMin ? { salaryMax: { $gte: parseInt(query.salaryMin as string) } } : {}),
        // Text search either title or company
        ...(query.search ? {$or: [
            { title: { $regex: new RegExp((query.search as string).trim(), 'i') } },
            { company: { $regex: new RegExp((query.search as string).trim(), 'i') } }
        ]} : {}),
    }

    // We don't want to filter on these values
    delete filters.search
    delete filters.salaryMin

    return filters
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData | JobData[] | boolean>
) {
    const { method } = req

    dbConnect()

    // TO DO: We don't want description or email fields
    if (method === 'GET') {
        const resultsPerPage = 10
        const pageIndex = req.query.pageIndex ? parseInt(req.query.pageIndex as string) : 0

        delete req.query.pageIndex
    
        const filters = getFilters(req.query)

        try {
            const jobs = await Job.find(filters).select('-email').select('-orderId')
                // TO DO: Remove createdAt
                .sort({ 'featured': -1, 'backfilled': 1, 'datePosted': -1, 'createdAt': -1 })
                .skip(pageIndex * resultsPerPage)
                .limit(resultsPerPage)
                .exec() 
            res.status(200).json(jobs)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }

    // TO DO: This deletes backfilled jobs
    // if (method === 'DELETE') {
    //     try {
    //         const job = await Job.deleteMany({ backfilled: true })
    //         res.status(200).json(true)
    //     } catch(err) {
    //         // TO DO
    //         // @ts-ignore
    //         res.status(500).json(getErrorMessage(err))
    //     }
    // }
}
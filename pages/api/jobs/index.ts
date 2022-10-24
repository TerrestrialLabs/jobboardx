// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'

export type JobData = {
    _id: string
    createdAt: Date
    title: string
    company: string
    companyUrl: string
    type: string
    location: string
    skills: string[]
    perks: string[]
    featured: boolean
    applicationLink: string,
    description: string
    salaryMin: number
    salaryMax: number
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<JobData | JobData[]>
) {
    const { method } = req

    dbConnect()

    const filters: { [key: string ]: string | number | { $gte: number } | ({ title: { $regex: RegExp } } | { company: { $regex: RegExp; }; })[] } = {
        ...req.query,
        // Make sure job's max salary is at least equal to min salary requirement
        ...(req.query.salaryMin ? { salaryMax: { $gte: parseInt(req.query.salaryMin as string) } } : {}),
        // Text search either title or company
        ...(req.query.search ? {$or: [
            { title: { $regex: new RegExp(req.query.search as string, 'i') } },
            { company: { $regex: new RegExp(req.query.search as string, 'i') } }
        ]} : {}),
    }

    // We don't want to filter on these values
    delete filters.search
    delete filters.salaryMin

    if (method === 'GET') {
        try {
            const jobs = await Job.find(filters)
            res.status(200).json(jobs)
        } catch (err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
    
    if (method === 'POST') {
        try {
            const job = await Job.create(req.body)
            res.status(201).json(job)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}
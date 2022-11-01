export type Job = {
    _id: string
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


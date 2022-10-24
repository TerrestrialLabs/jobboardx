export type Job = {
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


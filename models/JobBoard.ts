import mongoose from 'mongoose'

const JobBoardSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    logo: { type: String },
    company: { type: String, required: true },
    email: { type: String, required: true },
    homeTitle: { type: String, required: true },
    homeSubtitle: { type: String, required: true },
    heroImage: { type: String },
    logoImage: { type: String },
    skills: { type: [String], default: [] },
    priceRegular: { type: Number, required: true },
    priceFeatured: { type: Number, required: true },
    searchQuery: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.JobBoard || mongoose.model('JobBoard', JobBoardSchema)

export type JobBoardData = {
    _id: string
    createdAt: Date
    title: string
    domain: string
    company: string
    email: string
    homeTitle: string
    homeSubtitle: string
    heroImage: string
    logoImage: string
    skills: string[]
    priceFeatured: number
    priceRegular: number
    searchQuery: string
}
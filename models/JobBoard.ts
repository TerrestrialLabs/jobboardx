import mongoose from 'mongoose'

const JobBoardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    logo: { type: String },
    company: { type: String, required: true },
    email: { type: String, required: true },
    homeTitle: { type: String, required: true },
    homeSubtitle: { type: String, required: true },
    heroImage: { type: String },
    skills: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.models.JobBoard || mongoose.model('JobBoard', JobBoardSchema)
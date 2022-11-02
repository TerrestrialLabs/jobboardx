import mongoose from 'mongoose'

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    backfilled: { type: Boolean, required: true },
    company: { type: String, required: true },
    companyUrl: { type: String, required: true },
    companyLogo: { type: String, required: false },
    datePosted: { type: Date, required: true },
    // TO DO: Enum
    type: { type: String, required: true },
    location: { type: String, required: true },
    remote: { type: Boolean, required: true },
    skills: { type: [String], default: [] },
    perks: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    applicationLink: { type: String, required: true },
    description: { type: String, required: true },
    salaryMin: { type: Number, required: true, default: 0 },
    salaryMax: { type: Number, required: true, default: 0 }
}, { timestamps: true })

export default mongoose.models.Job || mongoose.model('Job', JobSchema)
import mongoose from 'mongoose'

const JobUpdateRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    jobId: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.JobUpdateRequest || mongoose.model('JobUpdateRequest', JobUpdateRequestSchema)
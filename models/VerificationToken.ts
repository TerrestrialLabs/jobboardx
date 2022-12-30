import mongoose from 'mongoose'

const VerificationTokenSchema = new mongoose.Schema({
    identifier: { type: String, required: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true }
}, { timestamps: true })

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema)
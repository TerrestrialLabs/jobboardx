import mongoose from 'mongoose'

const UserEventSchema = new mongoose.Schema({
    jobboardId: { type: String, required: true },
    // TO DO: Enum
    type: { type: String, required: true },
    subtype: { type: String },
    jobId: { type: String, required: true },
    ipAddress: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.UserEvent || mongoose.model('UserEvent', UserEventSchema)
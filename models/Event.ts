import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
    // TO DO: Enum
    event: { type: String, required: true },
    jobId: { type: String, required: true },
    ipAddress: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
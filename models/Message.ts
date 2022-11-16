import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    category: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    message: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.Message || mongoose.model('Message', MessageSchema)
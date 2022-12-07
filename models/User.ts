import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    jobboardId: { type: String, required: true },
    // TO DO: Enum
    role: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
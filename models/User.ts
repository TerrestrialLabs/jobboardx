import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    company: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    jobboardId: { type: String, required: true },
    logo: { type: String },
    // TO DO: Enum
    role: { type: String, required: true }
}, { timestamps: true })

export type UserType = {
    company: string,
    email: string,
    website: string,
    jobboardId: string,
    logo: string
    // TO DO: Enum
    role: string
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
import mongoose from 'mongoose'

const TwitterKeySchema = new mongoose.Schema({
    jobboardId: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    apiKeySecret: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true, unique: true },
    accessTokenSecret: { type: String, required: true, unique: true },
    bearerToken: { type: String, required: true, unique: true }
}, { timestamps: true })

export default mongoose.models.TwitterKey || mongoose.model('TwitterKey', TwitterKeySchema)

export type TwitterKeyType = {
    jobboardId: string
    apiKey: string
    apiKeySecret: string
    accessToken: string
    accessTokenSecret: string
    bearerToken: string
}
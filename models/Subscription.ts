import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema({
    jobboardId: { type: String, required: true },
    email: { type: String, required: true, unique: true }
}, { timestamps: true })

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
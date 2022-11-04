import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true }
}, { timestamps: true })

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
import mongoose from 'mongoose'

const BillingAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
}, { _id : false })

const UserSchema = new mongoose.Schema({
    company: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    jobboardId: { type: String, required: true },
    logo: { type: String },
    // TO DO: Enum
    role: { type: String, required: true },
    billingAddress: { type: BillingAddressSchema, default: null }
}, { timestamps: true })

export type UserType = {
    _id: string,
    company: string,
    email: string,
    website: string,
    jobboardId: string,
    logo: string
    // TO DO: Enum
    role: string,
    billingAddress: {
        firstName: string,
        lastName: string,
        addressLine1: string,
        addressLine2: string,
        city: string,
        state: string,
        country: string,
        postalCode: string
    } | null
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
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

const EmployerSchema = new mongoose.Schema({
    jobboardId: { type: String, required: true },
    company: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    logo: { type: String },
    billingAddress: { type: BillingAddressSchema, default: null }
}, { _id : false })

const AdminSchema = new mongoose.Schema({
    jobboardId: { type: String, required: true },
}, { _id : false })

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    // TO DO: Enum
    role: { type: String, required: true },
    employer: { type: EmployerSchema, default: null },
    admin: { type: AdminSchema, default: null }
}, { timestamps: true })

export type EmployerType = {
    jobboardId: string
    company: string
    website: string
    logo: string
    billingAddress: {
        firstName: string
        lastName: string
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        country: string
        postalCode: string
    } | null
}

export type AdminType = {
    jobboardId: string
}

export type UserType = {
    _id: string
    email: string
    role: string
    employer: EmployerType | null
    admin: AdminType | null
}

export type Employer = UserType & {
    employer: EmployerType
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
import { NextPage } from "next"
import { PostForm } from "../../post"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// We don't need stripe but can't conditionally use hooks in PostForm
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PK as string)

const Edit: NextPage = () => {
    return (
        <Elements stripe={stripe}>
            <PostForm edit />
        </Elements>
    )
}

export default Edit
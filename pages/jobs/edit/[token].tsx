import { NextPage } from "next"
import { PostForm } from "../../post"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Head from 'next/head'
import { useContext } from 'react'
import { JobBoardContext, JobBoardContextValue } from "../../../context/JobBoardContext"

// We don't need stripe but can't conditionally use hooks in PostForm
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PK as string)

const Edit: NextPage = () => {
    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    return (
        <Elements stripe={stripe}>
            <Head>
                <title>{`${jobboard.title} | Update job`}</title>
                <meta name="description" content="Update job" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <PostForm edit />
        </Elements>
    )
}

export default Edit
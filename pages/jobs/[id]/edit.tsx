import { GetServerSideProps, NextPage } from "next"
import { PostForm } from "../../post"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { JobBoardContext, JobBoardContextValue } from '../../../context/JobBoardContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Box, CircularProgress, Typography } from '@mui/material'

// TO DO: We don't need stripe but can't conditionally use hooks in PostForm
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PK as string)

const Edit: NextPage = () => {
    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    const { data: session, status } = useSession()
    const [signedIn, setSignedIn] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (session?.user) {
            setSignedIn(true)
        }
    }, [session?.user])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    if (status === 'loading' || (signedIn && status === 'unauthenticated')) {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Typography>Access Denied</Typography>
            </Box>
        )
    }

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

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: { } }
}
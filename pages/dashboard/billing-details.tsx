import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import Dashboard from '../../components/dashboard'

const BillingDetails: NextPage = () => {
    const { data: session, status } = useSession()

    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    if (status === 'loading') {
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
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Company profile`}</title>
                <meta name="description" content="Dashboard: Company profile" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard>
                <Grid xs={12} pb={4}>
                    <Box sx={{ backgroundColor: '#fff'}} p={4}>
                        <Grid xs={12}>
                            <Box>
                                <Typography fontWeight='bold'>Billing Details</Typography>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </Dashboard>

        </div>
    )
}

export default BillingDetails

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}
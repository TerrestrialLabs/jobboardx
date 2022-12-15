import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/Dashboard'

const BillingDetails: NextPage = () => {
    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Company profile`}</title>
                <meta name="description" content="Dashboard: Company profile" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={4}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={4}>
                        <Grid xs={12}>
                            <Box>
                                <Typography fontWeight='bold'>Billing Details</Typography>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            )} />

        </div>
    )
}

export default BillingDetails

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}
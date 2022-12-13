import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/dashboard'
import { JobData } from '../api/jobs'
import axios from 'axios'

const Jobs: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const [jobs, setJobs] = useState<JobData[]>([])

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const fetchJobs = async () => {
        const res = await axios.get(`${baseUrlApi}jobs/employer-jobs`)
        setJobs(res.data)
    }

    useEffect(() => {
        fetchJobs()
    }, [])

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
                                <Typography fontWeight='bold'>Jobs</Typography>
                            </Box>

                            <Box>
                                {jobs.map(job => (
                                    <Box>{job.title}</Box>
                                ))}
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            )} />

        </div>
    )
}

export default Jobs

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}
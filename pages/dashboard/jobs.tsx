import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/dashboard'
import axios from 'axios'
import { ListItem } from '../../components/ListItem'
import { JobData } from '../../models/Job'

const Jobs: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const [data, setData] = useState<JobData[]>([])
    const [fetched, setFetched] = useState(false)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const fetchData = async () => {
        const res = await axios.get(`${baseUrlApi}jobs/employer-jobs`)
        setData(res.data)
        setFetched(true)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Jobs`}</title>
                <meta name="description" content="Dashboard: Jobs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={4}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={4}>
                        <Grid xs={12}>
                            {fetched && data.length > 0 && (
                                <Grid xs={12}>
                                    <Box>
                                        <Typography fontWeight='bold'>{data.length} job{data.length > 1 ? 's' : ''}</Typography>
                                    </Box>
                                </Grid>
                            )}

                            {fetched && !data.length && (
                                <Box>
                                    <Typography textAlign='center'>No jobs posted</Typography>
                                </Box>
                            )}

                            {fetched && data.length > 0 && (
                                <Box mt={2}>
                                    {data.map((job, index) => (
                                        <ListItem
                                            isDashboardJob
                                            key={job._id} 
                                            first={index === 0} 
                                            last={index === data.length - 1}
                                            {...job}
                                        />
                                    ))}
                                </Box>
                            )}
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
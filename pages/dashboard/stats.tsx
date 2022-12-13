import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import { useRouter } from 'next/router'
import Dashboard from '../../components/dashboard'
import axios from 'axios'
import { AnalticsStatsType } from '../api/analytics'
import { useSession } from 'next-auth/react'

const Stats: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { status } = useSession()

    const [data, setData] = useState<AnalticsStatsType>()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const fetchData = async () => {
        const res = await axios.get(`${baseUrlApi}analytics`)
        setData(res.data)
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData()
        }
    }, [status])

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Stats`}</title>
                <meta name="description" content="Dashboard: Stats" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <>
                    <Grid xs={12} pb={4}>
                        <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={4}>
                            <Grid xs={12}>
                                <Box>
                                    <Typography fontWeight='bold'>This month</Typography>
                                </Box>
                            </Grid>

                            <Grid xs={12} display='flex'>
                                <Grid pr={4} xs={4}>
                                    <Box pt={2} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                        <Box mb={0.75}><Typography>Job views</Typography></Box>
                                        <Box><Typography color='primary' fontSize={24} fontWeight='bold'>{data ? data.views : 0}</Typography></Box>
                                    </Box>
                                </Grid>
                                <Grid xs={4}>
                                    <Box pt={2} pr={4} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                        <Box><Typography mb={0.75}>Applications via link</Typography></Box>
                                        <Box><Typography color='primary' fontSize={24} fontWeight='bold'>{data ? data.urlApplyClicks : 0}</Typography></Box>
                                    </Box>
                                </Grid>
                                <Grid pt={2} pl={4} xs={4}>
                                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                        <Box><Typography mb={0.75}>Applications via email</Typography></Box>
                                        <Box><Typography color='primary' fontSize={24} fontWeight='bold'>{data ? data.emailApplyClicks : 0}</Typography></Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid xs={12}>
                        <Box sx={{ backgroundColor: '#fff', width: '100%'}} p={4}>
                            <Grid xs={12}>
                                <Box>
                                    <Typography fontWeight='bold'>Total</Typography>
                                </Box>
                            </Grid>

                            <Grid xs={12} display='flex'>
                                <Grid xs={4} pr={4}>
                                    <Box pt={2} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                        <Box mb={0.75}><Typography>Jobs posted</Typography></Box>
                                        <Box><Typography color='primary' fontSize={24} fontWeight='bold'>{data ? data.jobs : 0}</Typography></Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </>
            )} />

        </div>
    )
}

export default Stats

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}
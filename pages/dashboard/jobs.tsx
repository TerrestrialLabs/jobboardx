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
import { JobData } from '../../models/Job'
import { useRouter } from 'next/router'
import { AccessTime, Delete, Edit, LocationOn, Paid } from '@mui/icons-material'
import { formatSalaryRange, getTimeDifferenceString } from '../../utils/utils'
import { TYPE_MAP } from '../../const/const'
import Link from 'next/link'

const Jobs: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const [data, setData] = useState<JobData[]>([])
    const [fetched, setFetched] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const fetchData = async () => {
        const res = await axios.get(`${baseUrlApi}jobs/employer-jobs`)
        setData(res.data)
        setFetched(true)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // const days = 31 // For last 4 days
    // const currentDate = new Date()
    // const thirdyDaysAgoDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000))

    // console.log('currentDate: ', currentDate)
    // console.log('thirdyDaysAgoDate: ', thirdyDaysAgoDate)
    // console.log('currentDate > thirdyDaysAgoDate: ', currentDate > thirdyDaysAgoDate)

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Jobs`}</title>
                <meta name="description" content="Dashboard: Jobs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={4}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={mobile ? 2 : 4} pb={mobile ? 3 : 4}>
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
                                        <JobItem
                                            key={job._id} 
                                            first={index === 0} 
                                            last={index === data.length - 1}
                                            isFocused={focusedIndex === index}
                                            setFocused={() => setFocusedIndex(index)}
                                            clearFocus={() => setFocusedIndex(null)}
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

type JobItem = JobData & {
    first: boolean
    last: boolean
    isFocused: boolean
    setFocused: () => void
    clearFocus: () => void
}
export const JobItem = ({
    _id,
    first,
    last,
    datePosted,
    title,
    type,
    location,
    remote,
    featured,
    salaryMin,
    salaryMax,
    isFocused,
    setFocused,
    clearFocus
}: JobItem) => {
    const router = useRouter()
  
    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const days = 31 // For last 4 days
    const currentDate = new Date()
    const thirdyDaysAgoDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const expired = (new Date(datePosted)) < thirdyDaysAgoDate

    return (
        <Box p={2} onMouseEnter={setFocused} onMouseLeave={clearFocus} sx={{ 
            backgroundColor: featured ? 'lightyellow' : '#FAF9F6',
            border: '1px solid #e8e8e8',
            borderTopLeftRadius: first ? 4 : 0,
            borderTopRightRadius: first ? 4 : 0,
            borderBottomLeftRadius: last ? 4 : 0,
            borderBottomRightRadius: last ? 4 : 0
        }}>
            <Grid container alignItems='center'>
                <Grid xs={9} sm={5}>
                    <Box mr={2}>
                        <Box display='flex'>
                            <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{featured ? 'Featured' : 'Regular'}</Typography>
                            {!expired && <Typography ml={1} color='grey' variant='subtitle1' sx={{ fontSize: '13.5px' }}>{getTimeDifferenceString(datePosted, true)}</Typography>}
                            {expired && <Typography ml={1} color='error' variant='subtitle1' sx={{ fontSize: '13.5px' }}>Expired</Typography>}
                        </Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: '600' }}><Link href={`/jobs/${_id}`}>{title}</Link></Typography>
                    </Box>
                </Grid>

                {mobile && (
                    <Grid xs={3} container justifyContent='flex-end'>
                        <Box display='flex' alignItems='center' justifyContent='flex-end' color='grey'>
                            <Link href={`/jobs/${_id}/edit`}><Edit sx={{ marginRight: 1, cursor: 'pointer' }} /></Link>
                            <Link href={''}><Delete sx={{ cursor: 'pointer' }} /></Link>
                        </Box>
                    </Grid>
                )}

                <Grid xs={12} sm={6}>
                    <Box mt={1} mr={2} display='flex' flexWrap='wrap' color='grey' alignItems='center'>
                        <Box mb={0.25} display='flex' alignItems='center'>
                            <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>
                        </Box>
        
                        <Box mb={0.25} display='flex' alignItems='center'>
                            <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>
                        </Box>
        
                        <Box display='flex' alignItems='center'>
                            <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
                        </Box>
                    </Box>
                </Grid>

                {!mobile && isFocused && (
                    <Grid xs={1} container>
                        <Box display='flex' alignItems='center'>
                            <Link href={`/jobs/${_id}/edit`}><Edit sx={{ marginRight: 1, cursor: 'pointer' }} /></Link>
                            <Link href={''}><Delete sx={{ cursor: 'pointer' }} /></Link>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    )
 }
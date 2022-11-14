import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Grid, IconButton, Link, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import type { JobData } from '../api/jobs'
import { format, parseISO } from 'date-fns'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import { TYPE_MAP } from '../../const/const'
import { formatSalaryRange } from '../../utils/utils'
import axios from 'axios'
import ReactHtmlParser from 'react-html-parser'
import NextLink from 'next/link'
import { useWindowSize } from '../../hooks/hooks'
import EmailFooter from '../../components/EmailFooter'
import Footer from '../../components/Footer'

interface Props {
    data: JobData
}

// TO DO: Dynamically change head
const JobDetail: NextPage<Props> = ({ data }) => {
    const [loading, setLoading] = useState(false)
    const [companyJobsCount, setCompanyJobsCount] = useState(0)
    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const description = ReactHtmlParser(data.description)
    const location = getLocationString()

    // TO DO: TESTING
    const createJobUpdateRequest = () => {
        axios.post('http://localhost:3000/api/job-update-requests', {
            email: 'hgagdere@gmail.com',
            jobId: router.query.id
        })
    }

    const fetchCompanyJobsCount = async () => {
        const res = await axios.get(`http://localhost:3000/api/jobs/count`, { params: { search: data.company } })
        setCompanyJobsCount(res.data)
    }

    useEffect(() => {
        fetchCompanyJobsCount()
    }, [])

    function getLocationString() { 
        if (data.location.toLowerCase() === 'remote') {
            return 'Remote'
        } else {
            return data.remote ? `${data.location} | Remote` : data.location
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>React Jobs | Post a job</title>
                <meta name="description" content="Post a job" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
    
            <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
                <Grid container justifyContent='center'>
                    <Grid item xs={11} sm={10} display='flex' justifyContent='space-between'>
                        <Link href='/'><Typography color='#fff' variant='h4' sx={{ cursor: 'pointer' }}>React Jobs</Typography></Link>
                        <Button sx={{ flexShrink: 0 }} href='/post' variant='contained' color='secondary' disableElevation>Post a job</Button>
                    </Grid>
                </Grid>
            </Box>

            {/* {emailSubmitted && (
                <Alert variant='filled' sx={{ position: 'fixed', width: '100%', zIndex: 998, paddingTop: '64px' }} onClose={() => setEmailSubmitted(false)}>
                    You'll be receiving job alerts to your inbox soon!
                </Alert>
            )} */}

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>

                {/* TO DO: TESTING */}
                <Button onClick={createJobUpdateRequest}>EDIT</Button>

                {data && (
                    <Grid container justifyContent='center' pt={mobile ? 0 : 2} pb={mobile ? 0 : 4}>
                        <Grid item xs={12} sm={10} lg={9} p={2} container>
                            <Grid item xs={12} sm={8}>
                                <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                    <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ borderBottom: '1px solid #e8e8e8'}}>
                                        {/* {!mobile && (
                                            <Grid item xs={12} display='flex' justifyContent={'flex-end'}>
                                                <Typography color='grey' variant='subtitle2'>{format(parseISO(data.datePosted ? data.datePosted.toString() : data.createdAt.toString()), 'MMMM d, yyyy')}</Typography>
                                            </Grid>
                                        )} */}

                                        <Grid item xs={12}>
                                            <Typography mb={mobile ? 1.5 : 2} variant='h1' fontSize={mobile ? 22 : 30} fontWeight='bold'>{data.title}</Typography>

                                            <Box mb={1.5}>
                                                <Typography color='grey' variant='subtitle2'>{format(parseISO(data.datePosted ? data.datePosted.toString() : data.createdAt.toString()), 'MMM. d, yyyy')}</Typography>
                                            </Box>

                                            <Box display='flex' flexDirection={mobile ? 'column' : 'row'} alignItems={mobile ? 'flex-start' : 'center'}>
                                                <Box display='flex' alignItems='center'>
                                                    <LocationOn fontSize='small' style={{marginRight: '0.25rem', marginLeft: mobile ? 0 : '-3px'}} />
                                                    <Typography variant='subtitle2' mr={2}>{location || 'N/A'}</Typography>
                                                </Box>

                                                <Box display='flex' alignItems='center' mt={mobile ? 0.5 : 0}>
                                                    <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2' mr={2}>{TYPE_MAP[data.type] || data.type || 'N/A'}</Typography>
                                                </Box>

                                                <Box display='flex' alignItems='center' mt={mobile ? 0.5 : 0}>
                                                    <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2'>{formatSalaryRange(data.salaryMin, data.salaryMax)}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        {mobile && (
                                           <Box display='flex' justifyContent='center' mt={2}>
                                            <Grid item xs={12}>
                                                <Button fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
                                                    Apply
                                                </Button>
                                            </Grid>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4}>
                                        <Grid item xs={12} mb={4}>
                                            <Typography fontSize={18} fontWeight='bold' mb={1}>Description</Typography>
                                            <Box sx={{ fontFamily: 'Poppins, sans-serif', marginLeft: 0.75 }}>
                                                {description}
                                            </Box>
                                        </Grid>

                                        {data.skills.length > 0 && (
                                            <Grid item xs={12} mb={2}>
                                                <Box mt={2}>
                                                    <Typography mb={1} fontSize={18} fontWeight='bold'>Skills</Typography>
                                                    <Box display='flex' flexWrap='wrap'>
                                                        {data.skills.map(skill => 
                                                            <Box key={skill} sx={{
                                                                backgroundColor: 'secondary.main',
                                                                color: '#fff',
                                                                border: '1px solid #fff',
                                                                borderColor: 'secondary.main',
                                                                margin: 0.5,
                                                                padding: 0.75,
                                                                borderRadius: 1,
                                                                transition: '0.3s',
                                                                fontSize: '14.5px',
                                                                fontWeight: 600,
                                                            }}>
                                                                {skill}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}

                                        {data.perks.length > 0 && (
                                            <Grid item xs={12} mb={2}>
                                                <Box mt={2}>
                                                    <Typography mb={1} fontSize={18} fontWeight='bold'>Perks</Typography>
                                                    <Box display='flex' flexWrap='wrap'>
                                                        {data.perks.map(perk => 
                                                            <Box key={perk} sx={{
                                                                backgroundColor: '#e74c3c',
                                                                color: '#fff',
                                                                border: '1px solid #e74c3c',
                                                                borderColor: '#e74c3c',
                                                                margin: 0.5,
                                                                padding: 0.75,
                                                                borderRadius: 1,
                                                                transition: '0.3s',
                                                                fontSize: '14.5px',
                                                                fontWeight: 600,
                                                            }}>
                                                                {perk}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} p={0} mt={6}>
                                            <Box display='flex' justifyContent='center'>
                                                <Grid item xs={12} sm={6}>
                                                    <Button fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
                                                        Apply
                                                    </Button>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <CompanyBox companyJobsCount={companyJobsCount} data={data} mobile={mobile} />

                                {/* {alertsPopupOpen && (
                                    <Box ml={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1, position: 'fixed', bottom: 0 }}>
                                        <IconButton onClick={() => setAlertsPopupOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                                            <Close />
                                        </IconButton>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography mb={1.25}>
                                                Get weekly job alerts
                                            </Typography>
                                            <FilledInput value={email} onChange={(e) => setEmail(e.target.value)} fullWidth error={emailError} disableUnderline={!emailError} placeholder='Your email address' />
                                            {emailError && <FormHelperText error>Invalid email address</FormHelperText>}
                                        </FormControl>
                                        <Button onClick={createSubscription} fullWidth variant='contained' disableElevation color='secondary' style={{ marginTop: '1.25rem' }}>
                                            {emailLoading ? <CircularProgress color='secondary' size={22} /> : 'Subscribe'}
                                        </Button>
                                    </Box>
                                )} */}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </main>

            <EmailFooter />

            <Footer />
        </div>
    )
}

export default JobDetail;

type CompanyBoxProps = {
    companyJobsCount: number
    data: JobData
    mobile: boolean
}
const CompanyBox = ({ companyJobsCount, data, mobile }: CompanyBoxProps) => {
    return (
        <Box ml={mobile ? 0 : 4} mt={mobile ? 2 : 0} mb={mobile ? 2 : 4} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column' alignItems='center'>
            <Box display='flex' flexDirection='column' alignItems='center'>
                <Box mb={1} sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
                    {data.companyLogo && <img style={{ borderRadius: '50%' }} src={data.companyLogo} alt="Company logo" width={'100%'} height={'100%'} />}
                    {!data.companyLogo && <Typography fontSize={20}>{data.company.slice(0, 1).toUpperCase()}</Typography>}
                </Box>
                <NextLink href={`/?search=${data.company}`}>
                    <Typography mb={1} fontWeight='bold' sx={{ cursor: 'pointer '}}>
                        {data.company}
                    </Typography>
                </NextLink>
            </Box>
            <NextLink href={`/?search=${data.company}`}>
                <Typography sx={{ cursor: 'pointer '}} variant='subtitle2' color='grey'>{`${companyJobsCount} job${companyJobsCount === 1 ? '' : 's'}`}</Typography>
            </NextLink>
            {data.companyUrl && data.companyUrl !== 'N/A' && (
                <Link href={data.companyUrl} sx={{ textDecoration: 'none' }} rel='noopener noreferrer' target='_blank'>
                    <Typography variant='caption'>Visit company website</Typography>
                </Link>
            )}
            {!mobile && (
                <Button fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary' style={{ marginTop: '1rem' }}>
                    Apply
                </Button>
            )}
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const res = await axios.get(`http://localhost:3000/api/jobs/${params?.id}`)

    return {
        props: {
            data: {
                ...res.data
            }
        }
    }
}
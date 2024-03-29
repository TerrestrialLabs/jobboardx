import { Box, Button, Grid, Link, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import { format, parseISO } from 'date-fns'
import { AccessTime, LocationOn, Paid } from '@mui/icons-material'
import { TYPE_MAP } from '../../const/const'
import { formatSalaryRange, isExpired } from '../../utils/utils'
import axios from 'axios'
import ReactHtmlParser from 'react-html-parser'
import NextLink from 'next/link'
import { useWindowSize } from '../../hooks/hooks'
import EmailFooter from '../../components/EmailFooter'
import { JobData } from '../../models/Job'
import ErrorPage from 'next/error'
import { JobBoardData } from '../../models/JobBoard'

interface Props {
    data: JobData
    errorStatus: number | null
    baseUrl: string
    baseUrlApi: string
    jobboard: JobBoardData
}

const JobDetail: NextPage<Props> = ({ data, errorStatus, jobboard, baseUrlApi }) => {
    const [companyJobsCount, setCompanyJobsCount] = useState(0)

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !windowSize.width || windowSize.width < 500
    const sizeMedium = !!windowSize.width && (windowSize.width > 500 && windowSize.width < 900)

    const trackJobView = () => {
        if (data) {
            axios.post(`${baseUrlApi}analytics/job-views`, { jobboardId: jobboard._id, jobId: router.query.id })
        }
    }

    const trackJobApplyClick = () => {
        if (data) {
            axios.post(`${baseUrlApi}analytics/job-apply-clicks`, { jobboardId: jobboard._id, jobId: router.query.id, subtype: data.applicationLink.startsWith('http') ? 'url' : 'email' })
        }
    }

    useEffect(() => {
        trackJobView()
    }, [router.query.id])

    const fetchCompanyJobsCount = async () => {
        const params: { [key: string]: string } = { jobboardId: jobboard._id }
        if (data.backfilled) {
            params.company = data.company
        } else {
            params.employerId = data.employerId as string
        }
        const res = await axios.get(`${baseUrlApi}jobs/count`, { params })
        setCompanyJobsCount(res.data)
    }

    useEffect(() => {
        if (data) {
            fetchCompanyJobsCount()
        }
    }, [])

    function getLocationString() { 
        if (data.location.toLowerCase() === 'remote') {
            return 'Remote'
        } else {
            return data.remote ? `${data.location} | Remote` : data.location
        }
    }

    if (errorStatus === 404) {
        return <ErrorPage statusCode={errorStatus} />
    }

    if (errorStatus === 500) {
        return <ErrorPage statusCode={errorStatus} />
    }

    const expired = isExpired(data.datePosted)
    const description = ReactHtmlParser(data.description)
    const location = getLocationString()

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | ${data.title} @ ${data.company}`}</title>
                <meta name="description" content={`${data.title} @ ${data.company}`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid  container justifyContent='center' pt={mobile ? 2 : 4} pb={mobile ? 0 : 4}>
                    <Grid item xs={11} sm={10} lg={9} container spacing={mobile ? 2 : 4}>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ backgroundColor: '#fff', borderRadius: 1, position: 'relative' }}>
                                <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ borderBottom: '1px solid #e8e8e8'}}>
                                    <Grid item xs={12}>
                                        <Typography mb={mobile ? 1.5 : 2} variant='h1' fontSize={mobile ? 22 : 30} fontWeight='bold'>{data.title}</Typography>

                                        {(mobile || sizeMedium) && (
                                            <Box mb={sizeMedium ? 2 : 0}>
                                                <NextLink href={`/?search=${data.company}`}>
                                                    <Typography mb={1} sx={{ cursor: 'pointer '}}>
                                                        {data.company}
                                                    </Typography>
                                                </NextLink>
                                            </Box>
                                        )}

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
                                    {mobile && !expired && (
                                        <Box display='flex' justifyContent='center' mt={2}>
                                            <Grid item xs={12}>
                                                <Button onClick={trackJobApplyClick} fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
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

                                    {!expired && (
                                        <Grid item xs={12} p={0} mt={6}>
                                            <Box display='flex' justifyContent='center'>
                                                <Grid item xs={12} sm={6}>
                                                    <Button onClick={trackJobApplyClick} fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
                                                        Apply
                                                    </Button>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    )}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <CompanyBox expired={expired} trackJobApplyClick={trackJobApplyClick} companyJobsCount={companyJobsCount} data={data} mobile={mobile} sizeMedium={sizeMedium} />
                        </Grid>
                    </Grid>
                </Grid>
            </main>

            <EmailFooter />
        </div>
    )
}

export default JobDetail;

type CompanyBoxProps = {
    companyJobsCount: number
    data: JobData
    expired: boolean
    mobile: boolean
    sizeMedium: boolean
    trackJobApplyClick: () => void
}
const CompanyBox = ({ companyJobsCount, data, expired, mobile, sizeMedium, trackJobApplyClick }: CompanyBoxProps) => {
    return (
        <Box mb={mobile ? 2 : 0} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column' alignItems='center'>
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
            {!mobile && !sizeMedium && !expired && (
                <Button onClick={trackJobApplyClick} fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary' style={{ marginTop: '1rem' }}>
                    Apply
                </Button>
            )}
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const local = context.req.headers.host?.includes('localhost')
    const baseUrl = local ? process.env.NEXT_PUBLIC_BASE_URL_LOCAL : `https://${context.req.headers.host}/`
    const baseUrlApi = `${baseUrl}api/`

    let data = null
    let errorStatus = null
    let jobboard = null

    try {
        const res = await axios.get(`${baseUrlApi}jobs/${context.params?.id}`)
        data = res.data
    } catch (err) {
        // @ts-ignore
        errorStatus = err.response.status
    }

    if (data) {
        const jobboardRes = await axios.get(`${baseUrlApi}jobboards/current`)
        jobboard = jobboardRes.data
    }

    return {
        props: {
            errorStatus,
            data,
            jobboard,
            baseUrlApi,
            baseUrl
        }
    }
}
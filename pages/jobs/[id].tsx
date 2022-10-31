import { Box, Button, CircularProgress, FilledInput, FormControl, Grid, IconButton, Link, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import type { JobData } from '../api/jobs'
import { format } from 'date-fns'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import { TYPE_MAP, LOCATION_MAP } from '../../const/const'
import { formatSalaryRange } from '../../utils/utils'
import axios from 'axios'
import ReactHtmlParser from 'react-html-parser'

// import dynamic from 'next/dynamic'
// const Table = dynamic(() => import("/design-systems/Molecules/Table"), {
//     ssr: false,
// });

interface Props {
    data: JobData
}

// TO DO: Dynamically change head
const JobDetail: NextPage<Props> = ({ data }) => {
    const [loading, setLoading] = useState(false)
    const [companyJobsCount, setCompanyJobsCount] = useState(0)
    const [alertsPopupOpen, setAlertsPopupOpen] = useState(true)
    const router = useRouter()
    const { id } = router.query

    // const description = data.description
    const description = ReactHtmlParser(data.description)

    const fetchCompanyJobsCount = async () => {
        const res = await axios.get(`http://localhost:3000/api/jobs/count`, { params: { search: data.company } })
        setCompanyJobsCount(res.data)
      }

    useEffect(() => {
        fetchCompanyJobsCount()
    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>React Jobs | Post a job</title>
                <meta name="description" content="Post a job" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
    
            <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
                <Grid container justifyContent='center'>
                    <Grid item xs={10} display='flex' justifyContent='space-between'>
                        <Link href='/'><Typography color='#fff' variant='h4' sx={{ cursor: 'pointer' }}>React Jobs</Typography></Link>
                        <Button sx={{ flexShrink: 0 }} href='/post' variant='contained' color='secondary' disableElevation>Post a job</Button>
                    </Grid>
                </Grid>
            </Box>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                {data && (
                    <Grid container justifyContent='center' pt={2} pb={4}>
                        <Grid item xs={10} lg={9} p={2} container>
                            <Grid item xs={8}>
                                <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                    <Box p={4} sx={{ borderBottom: '1px solid #e8e8e8'}}>
                                        <Grid item xs={12} display='flex' justifyContent='flex-end'>
                                            {/* <Typography variant='subtitle2'>{format(data.createdAt, 'MMMM dd, yyyy')}</Typography> */}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography mb={2} variant='h1' fontSize={30} fontWeight='bold'>{data.title}</Typography>
                                                <Box display='flex' alignItems='center' color='grey'>
                                                    <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2' mr={2}>{data.location || 'N/A'}</Typography>

                                                    <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    {/* <Typography variant='subtitle2' mr={2}>{TYPE_MAP[data.type] || 'N/A'}</Typography> */}
                                                    <Typography variant='subtitle2' mr={2}>{TYPE_MAP[data.type] || data.type || 'N/A'}</Typography>

                                                    <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2'>{formatSalaryRange(data.salaryMin, data.salaryMax)}</Typography>
                                                </Box>
                                        </Grid>
                                    </Box>

                                    <Box p={4}>
                                        <Grid item xs={12} mb={4}>
                                            <Typography fontSize={18} fontWeight='bold' mb={1}>Description</Typography>
                                            <Box sx={{ fontFamily: 'Poppins, sans-serif', marginLeft: 0.75 }}>
                                                {description}
                                            </Box>
                                        </Grid>

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

                                        <Grid item xs={12} mb={2}>
                                            <Box mt={2}>
                                                <Typography mb={1} fontSize={18} fontWeight='bold'>Perks</Typography>
                                                <Box display='flex' flexWrap='wrap'>
                                                    {data.perks.map(skill => 
                                                        <Box key={skill} sx={{
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
                                                            {skill}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} p={0} mt={6}>
                                            <Box display='flex' justifyContent='center'>
                                                <Grid item xs={6}>
                                                    <Button fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
                                                        Apply
                                                    </Button>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Box>
                                </Box>

                                {/* <Grid xs={12}>
                                    <Box color='red' display='flex' justifyContent='space-between'>
                                        <Typography variant='caption'>*Required fields</Typography>
                                        <Button disabled={loading} onClick={createJob} variant='contained' disableElevation color='primary'>
                                            {loading ? <CircularProgress color='secondary' size={22} /> : 'Post job'}
                                        </Button>
                                    </Box>
                                </Grid> */}


                            </Grid>

                            <Grid item xs={4}>
                                <Box ml={4} mb={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column' alignItems='center'>
                                    <Box display='flex' flexDirection='column' alignItems='center'>
                                        <Box mb={1} sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
                                            {data.companyLogo && <img style={{ borderRadius: '50%' }} src={data.companyLogo} alt="Company logo" width={'100%'} height={'100%'} />}
                                            {!data.companyLogo && <Typography fontSize={20}>{data.company.slice(0, 1).toUpperCase()}</Typography>}
                                        </Box>
                                        <Typography mb={1} fontWeight='bold'>
                                            {data.company}
                                        </Typography>
                                    </Box>
                                    <Typography variant='subtitle2' color='grey'>{`${companyJobsCount} job${companyJobsCount === 1 ? '' : 's'}`}</Typography>
                                    {data.companyUrl && data.companyUrl !== 'N/A' && (
                                        <Link href={data.companyUrl} sx={{ textDecoration: 'none' }} rel='noopener noreferrer' target='_blank'>
                                            <Typography variant='caption'>Visit company website</Typography>
                                        </Link>
                                    )}
                                    <Button fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary' style={{ marginTop: '1rem' }}>
                                        Apply
                                    </Button>
                                </Box>

                                {alertsPopupOpen && (
                                    <Box ml={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1, position: 'fixed', bottom: 0 }}>
                                        <IconButton onClick={() => setAlertsPopupOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                                            <Close />
                                        </IconButton>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography mb={1.25}>
                                                Get weekly job alerts
                                            </Typography>
                                            <FilledInput fullWidth disableUnderline placeholder='Your email address' />
                                        </FormControl>
                                        <Button fullWidth variant='contained' disableElevation color='secondary' style={{ marginTop: '1.25rem' }}>
                                            Sign up
                                        </Button>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </footer>
        </div>
    )
}

export default JobDetail;

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
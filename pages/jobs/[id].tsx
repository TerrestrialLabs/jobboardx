import { Alert, Box, Button, CircularProgress, Divider, FilledInput, FormControl, FormHelperText, Grid, IconButton, Link, Modal, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import type { JobData } from '../api/jobs'
import { format, parseISO } from 'date-fns'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import { BASE_URL_API, TYPE_MAP } from '../../const/const'
import { formatSalaryRange } from '../../utils/utils'
import axios from 'axios'
import ReactHtmlParser from 'react-html-parser'
import NextLink from 'next/link'
import { useWindowSize } from '../../hooks/hooks'
import EmailFooter from '../../components/EmailFooter'
import { JobBoardData } from '../api/jobboards'

interface Props {
    data: JobData
    baseUrl: string
    baseUrlApi: string
    jobboard: JobBoardData
}

const JobDetail: NextPage<Props> = ({ data, jobboard, baseUrlApi }) => {
    const [companyJobsCount, setCompanyJobsCount] = useState(0)
    const [requestUpdateModalOpen, setRequestUpdateModalOpen] = useState(false)

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !windowSize.width || windowSize.width < 500

    const description = ReactHtmlParser(data.description)
    const location = getLocationString()

    const trackJobView = () => {
        axios.post(`${baseUrlApi}analytics/job-view`, { jobId: router.query.id })
    }

    const trackJobApplyClick = () => {
        axios.post(`${baseUrlApi}analytics/job-apply-click`, { jobId: router.query.id })
    }

    useEffect(() => {
        trackJobView()
    }, [router.query.id])

    // When request update panel open on mobile don't allow scroll
    useEffect(() => {
        if (requestUpdateModalOpen && mobile) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
    }, [requestUpdateModalOpen])

    const fetchCompanyJobsCount = async () => {
        const res = await axios.get(`${baseUrlApi}jobs/count`, { params: { search: data.company } })
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
                <title>{`${jobboard.title} | ${data.title} @ ${data.company}`}</title>
                <meta name="description" content={`${data.title} @ ${data.company}`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {mobile && requestUpdateModalOpen ? (
                <JobUpdateRequestModal mobile open={requestUpdateModalOpen} closeModal={() => setRequestUpdateModalOpen(false)} />
            ) : (
                <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                    {data && (
                        <Grid  container justifyContent='center' pt={mobile ? 0 : 2} pb={mobile ? 0 : 4}>
                            <Grid item xs={12} sm={10} lg={9} p={mobile ? 2 : 0} pt={2} container>
                                <Grid item xs={12} sm={8}>
                                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1, position: 'relative' }}>
                                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ borderBottom: '1px solid #e8e8e8'}}>
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

                                            <Grid item xs={12} p={0} mt={6}>
                                                <Box display='flex' justifyContent='center'>
                                                    <Grid item xs={12} sm={6}>
                                                        <Button onClick={trackJobApplyClick} fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary'>
                                                            Apply
                                                        </Button>
                                                    </Grid>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <CompanyBox trackJobApplyClick={trackJobApplyClick} companyJobsCount={companyJobsCount} data={data} mobile={mobile} />

                                    <Box ml={mobile ? 0 : 4} mt={mobile ? 2 : 0} mb={mobile ? 2 : 4} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column'>
                                        <Typography mb={2}>Is this your job?</Typography> 
                                        <Typography mb={2}>Click here to request a secure link to edit your posting.</Typography>
                                        <Button onClick={() => setRequestUpdateModalOpen(true)} fullWidth variant='contained' disableElevation color='secondary'>
                                            Request Update Link
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </main>
            )}

            {!mobile && requestUpdateModalOpen && <JobUpdateRequestModal mobile={mobile} open={requestUpdateModalOpen} closeModal={() => setRequestUpdateModalOpen(false)} />}

            <EmailFooter />

            {/* {!(mobile && requestUpdateModalOpen) && <Footer />} */}
        </div>
    )
}

export default JobDetail;

type CompanyBoxProps = {
    companyJobsCount: number
    data: JobData
    mobile: boolean
    trackJobApplyClick: () => void
}
const CompanyBox = ({ companyJobsCount, data, mobile, trackJobApplyClick }: CompanyBoxProps) => {
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
                <Button onClick={trackJobApplyClick} fullWidth href={data.applicationLink} variant='contained' disableElevation color='primary' style={{ marginTop: '1rem' }}>
                    Apply
                </Button>
            )}
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const protocol = context.req.headers.host?.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${context.req.headers.host}/`
    const baseUrlApi = `${baseUrl}api/`

    const res = await axios.get(`${baseUrlApi}jobs/${context.params?.id}`)
    const jobboardRes = await axios.get(`${baseUrlApi}jobboards/current`)

    return {
        props: {
            data: res.data,
            jobboard: jobboardRes.data,
            baseUrlApi,
            baseUrl
        }
    }
}

type JobUpdateRequestModalProps = { 
    closeModal: () => void,
    mobile: boolean,
    open: boolean
}
const JobUpdateRequestModal = ({ closeModal, mobile, open }: JobUpdateRequestModalProps) => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 24,
        p: 4
    }

    const createJobUpdateRequest = async () => {
        setLoading(true)
        if (!validate()) {
            setError(true)
            setLoading(false)
            return
        }
        setError(false)
        axios.post(`${BASE_URL_API}job-update-requests`, {
            email,
            jobId: router.query.id
        })
        setLoading(false)
        setSubmitted(true)
    }

    const validate = () => {
        return email.length > 0 && isValidEmail(email)
    }
    
    const isValidEmail = (email: string) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true)
        } else {
            return (false)
        }
    }

    const content = (
        <>
            {mobile ? (
                <Typography fontWeight='bold' fontSize={20} mb={2}>
                    Request update link
                </Typography>
            ) : (
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Request update link
                </Typography>
            )}
            
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                You will receive a secure link to update your job posting at the email which you used to create it.
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                The link will be valid for 24 hours.
            </Typography>

            {submitted && (
                <>
                    <Typography mt={3} color='success.main'>
                        An email with a job update link has been sent to your inbox.
                    </Typography>
                </>
            )}
            
            {!submitted && (
                <Box display='flex' flexDirection={mobile ? 'column' : 'row'} mt={2}>
                    <FormControl hiddenLabel fullWidth>
                        <FilledInput placeholder='Your email address' error={error} disableUnderline={!error} sx={{ marginRight: mobile ? 0 : '1rem', height: '45px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                        {error && <FormHelperText error>Invalid email address</FormHelperText>}
                    </FormControl>
                    <Button onClick={createJobUpdateRequest} variant='contained' disableElevation sx={{ height: '45px', marginTop: mobile ? 4 : 0 }}>
                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Request'}
                    </Button>
                </Box>
            )}
        </>
    )

    if (mobile) {
        return (
            <Box sx={{ paddingTop: '58px', position: 'fixed', height: '100vh', backgroundColor: '#fff', zIndex: 2, top: 0 }}>
                <Box p={2} pb={3} pt={mobile ? 0 : 2} position='relative'>
                    <IconButton onClick={closeModal} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                        <Close />
                    </IconButton>

                    <Box pt={3}>
                        {content}
                    </Box>
                </Box>
            </Box>
        )
    }

    return (
        <Modal open onClose={closeModal}>
            <Box p={mobile ? 2 : 4} sx={modalStyle} position='relative'>
                <IconButton onClick={closeModal} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <Close />
                </IconButton>

                {content}
            </Box>
        </Modal>
    )
}
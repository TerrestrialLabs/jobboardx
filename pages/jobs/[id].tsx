import { Box, Button, CircularProgress, FilledInput, Grid, IconButton, Link, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { collection, doc, getDoc } from 'firebase/firestore'
import { database } from '../../firebase/config'
import { useRouter } from 'next/router'
import type { Job } from '../index'
import { format } from 'date-fns'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'

const dbInstance = collection(database, 'jobs');

// TO DO: Dynamically change head
const JobDetail: NextPage = () => {
    const [data, setData] = useState<Job | null>(null)
    const [loading, setLoading] = useState(false)
    const [alertsPopupOpen, setAlertsPopupOpen] = useState(true)
    const router = useRouter()
    const { id } = router.query  

    const fetchJob = async () => {
        setLoading(true)
        const docRef = doc(database, 'jobs', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setData({...docSnap.data(), id: docSnap.id, datePosted: docSnap.data().datePosted.toDate() } as Job)
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
        // const req = await getDocs(query(dbInstance, orderBy('datePosted', 'desc')))
        // // TO DO: Figure out typing
        // const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, datePosted: doc.data().datePosted.toDate() })) as Job[]
        // setJob(jobDocs)
        setLoading(false)
      }

    useEffect(() => {
        if (id && !data) {
            fetchJob()
        }
      }, [id])

    return (
        <div className={styles.container}>
            <Head>
                <title>React Jobs | Post a job</title>
                <meta name="description" content="Post a job" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
    
            <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
                <Grid container justifyContent='center'>
                    <Grid xs={10} display='flex' justifyContent='space-between'>
                        <Link href='/'><Typography color='#fff' variant='h4' sx={{ cursor: 'pointer' }}>React Jobs</Typography></Link>
                        <Button sx={{ flexShrink: 0 }} href='/post' variant='contained' color='secondary' disableElevation>Post a job</Button>
                    </Grid>
                </Grid>
            </Box>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                {/* <Box py={10} bgcolor='primary.main' color='white'>
                    <Grid container justifyContent='center'>
                        <Grid xs={10} display='flex' justifyContent='space-between'>
                            <Typography variant='h4'>Job Posting</Typography>
                        </Grid>
                    </Grid>
                </Box> */}

                {data && (
                    <Grid container justifyContent='center' pt={2} pb={4}>
                        <Grid xs={10} lg={9} p={2} container>
                            <Grid xs={8}>
                                <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                    <Box p={4} sx={{ borderBottom: '1px solid #e8e8e8'}}>
                                        <Grid xs={12} display='flex' justifyContent='flex-end'>
                                            <Typography variant='subtitle2' mb={2}>{format(data.datePosted, 'MMMM dd, yyyy')}</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Typography mb={2} variant='h1' fontSize={30} fontWeight='bold'>{data.title}</Typography>
                                            {/* <Box display='flex'>
                                                    {data.skills.map(skill => 
                                                        <Box key={skill} sx={{
                                                            backgroundColor: 'primary.main',
                                                            color: '#fff',
                                                            border: '1px solid #fff',
                                                            borderColor: 'primary.main',
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
                                                </Box> */}

                                                <Box display='flex' alignItems='center' color='grey'>
                                                    <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2' mr={2}>Remote</Typography>

                                                    <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2' mr={2}>Full-time</Typography>

                                                    <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                                                    <Typography variant='subtitle2'>$90k - $140k</Typography>
                                                </Box>
                                        </Grid>
                                    </Box>

                                    <Box p={4}>
                                        {/* <Grid xs={12} sm={6} mb={2}>
                                            <Typography>{data.type}</Typography>
                                        </Grid>

                                        <Grid xs={12} sm={6} mb={2}>
                                            <Typography>{data.location}</Typography>
                                        </Grid> */}

                                        <Grid xs={12} mb={2}>
                                            <Typography fontWeight='bold' mb={1}>Description</Typography>
                                            <Typography>{data.description}</Typography>
                                        </Grid>

                                        <Grid xs={12} mb={2}>
                                            <Box mt={2}>
                                                <Typography fontWeight='bold'>Skills</Typography>
                                                <Box display='flex'>
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

                                        <Grid xs={12} mb={2}>
                                            <Box mt={2}>
                                                <Typography fontWeight='bold'>Perks</Typography>
                                                <Box display='flex' flexWrap='wrap'>
                                                    {[
                                                        'WFH', 
                                                        'Unlimited PTO',
                                                        'Health insurance', 
                                                        'Dental insurance', 
                                                        'Vision insurance',
                                                        'Parental leave',
                                                        'Gym membership'
                                                    ].map(skill => 
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

                                        <Grid xs={12} p={0} mt={4}>
                                            <Box display='flex' justifyContent='center'>
                                                <Grid xs={6}>
                                                    <Button fullWidth href={data.link} variant='contained' disableElevation color='primary'>
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

                            <Grid xs={4}>
                                <Box ml={4} mb={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column' alignItems='center'>
                                    <Box display='flex' flexDirection='column' alignItems='center'>
                                        <Box mb={1} sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#fff' }}>
                                            <Image src="/company_logo.png" alt="Treasure Data logo" width={'40%'} height={'40%'} />
                                        </Box>
                                        <Typography mb={1} fontWeight='bold'>
                                            {data.company}
                                        </Typography>
                                    </Box>
                                    <Link href={data.companyUrl} sx={{ textDecoration: 'none' }} rel='noopener noreferrer' target='_blank'>
                                        <Typography variant='caption'>Visit company website</Typography>
                                    </Link>
                                    <Button fullWidth href={data.link} variant='contained' disableElevation color='primary' style={{ marginTop: '1rem' }}>
                                        Apply
                                    </Button>
                                </Box>

                                {alertsPopupOpen && (
                                    <Box ml={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1, position: 'fixed', bottom: 0 }}>
                                        <IconButton onClick={() => setAlertsPopupOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                                            <Close />
                                        </IconButton>
                                        <Typography mb={1}>
                                            Get weekly job alerts
                                        </Typography>
                                        <FilledInput fullWidth disableUnderline placeholder='Your email address' />
                                        <Button fullWidth href={data.link} variant='contained' disableElevation color='secondary' style={{ marginTop: '1rem' }}>
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
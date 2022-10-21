import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { collection, doc, getDoc } from 'firebase/firestore'
import { database } from '../../firebase/config'
import { useRouter } from 'next/router'
import type { Job } from '../index'
import { format } from 'date-fns'

const dbInstance = collection(database, 'jobs');

// TO DO: Dynamically change head
const JobDetail: NextPage = () => {
    const [data, setData] = useState<Job | null>(null)
    const [loading, setLoading] = useState(false)
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
    
            <main className={styles.main}>
                {/* <Box py={10} bgcolor='primary.main' color='white'>
                    <Grid container justifyContent='center'>
                        <Grid xs={10} display='flex' justifyContent='space-between'>
                            <Typography variant='h4'>Job Posting</Typography>
                        </Grid>
                    </Grid>
                </Box> */}

                <Box py={1} bgcolor='primary.main' color='white' display='flex' sx={{ position: 'fixed', width: '100%' }}>
                    <Grid container justifyContent='center'>
                        <Grid xs={10} display='flex' justifyContent='space-between'>
                            <Typography variant='h4'>React Jobs</Typography>
                            <Button href='/post' variant='contained' color='secondary' disableElevation>Post a Job</Button>
                        </Grid>
                    </Grid>
                </Box>

                {data && (
                    <Grid container justifyContent='center' pt={2} mb={4}>
                        <Grid xs={10} lg={8} p={2} container spacing={2} 
                            // sx={{ borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8' }}
                        >
                            <Grid xs={12}>
                                <Typography>{format(data.datePosted, 'dd/MMMM/yyyy HH:MM')}</Typography>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{data.title}</Typography>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <Typography>{data.type}</Typography>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <Typography>{data.company}</Typography>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <Typography>{data.companyUrl}</Typography>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <Typography>{data.location}</Typography>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <Typography>{data.link}</Typography>
                            </Grid>

                            <Grid xs={12}>
                                <Typography>{data.description}</Typography>
                            </Grid>

                            <Grid xs={12} sm={6}>
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

                            {/* <Grid xs={12}>
                                <Box color='red' display='flex' justifyContent='space-between'>
                                    <Typography variant='caption'>*Required fields</Typography>
                                    <Button disabled={loading} onClick={createJob} variant='contained' disableElevation color='primary'>
                                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Post job'}
                                    </Button>
                                </Box>
                            </Grid> */}

                            <Grid xs={12} sm={6} p={0} mt={2}>
                                <Box display='flex' justifyContent='flex-start'>
                                    <Grid xs={12} sm={6}>
                                        <Button fullWidth href={data.link} variant='contained' disableElevation color='primary'>
                                            Apply
                                        </Button>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </main>
        </div>
    )
}

export default JobDetail;
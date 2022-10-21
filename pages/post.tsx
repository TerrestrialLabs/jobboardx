import { Box, Button, CircularProgress, FilledInput, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import type { Job } from './index'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { database, firebase } from '../firebase/config'
import { useRouter } from 'next/router'

export type PostForm = {
    title: string
    company: string
    companyUrl: string
    type: string
    location: string
    skills: string[]
    description: string
    featured: boolean
    link: string
}

const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node']

const includedStyle = {
    backgroundColor: 'secondary.main',
    color: '#fff'
}

// TO DO:
//  Company logo, location, level (j/m/s), benefits fields
//  Text editor functions or pre-formatted sections from multiple fields
//  Cache form progress in case user accidentally navigates away
//  Request edit post link email
//  Send email with link to posting and start + end dates
//  Posting preview
//  Stepper

const dbInstance = collection(database, 'jobs');

const Post: NextPage = () => {
    const [jobDetails, setJobDetails] = useState<PostForm>({
        title: '',
        company: '',
        companyUrl: '',
        type: 'fulltime',
        location: 'remote',
        description: '',
        link: '',
        skills: [],
        // TO DO: Hardcoded
        featured: false
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // TO DO: Validate urls - provide https if absent or add prefix before input
    const createJob = async () => {
        for (const field in jobDetails) {
            // @ts-ignore
            if ((typeof jobDetails[field] === 'string' && !jobDetails[field]) || !jobDetails.skills.length) {
                // TO DO: Validation
                console.log("EMPTY VALUE")
                return
            }
        }
        setLoading(true)
        await addDoc(dbInstance, { 
            ...jobDetails,
            title: jobDetails.title.trim(),
            company: jobDetails.company.trim(),
            companyUrl: jobDetails.companyUrl.trim(),
            description: jobDetails.description.trim(),
            link: jobDetails.link.trim(),
            datePosted: serverTimestamp()
        })
        setLoading(false)
        router.push('/')
    }

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleSkillsChange = (value: string) => {
        if (jobDetails.skills.includes(value)) {
            setJobDetails({ ...jobDetails, skills: jobDetails.skills.filter(skill => skill !== value) })
        } else {
            setJobDetails({ ...jobDetails, skills: [...jobDetails.skills, value] })
        }
    }
    
  return (
    <div className={styles.container}>
      <Head>
        <title>React Jobs | Post a job</title>
        <meta name="description" content="Post a job" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box py={10} bgcolor='primary.main' color='white'>
          <Grid container justifyContent='center'>
            <Grid xs={10} display='flex' justifyContent='space-between'>
              <Typography variant='h4'>Post a job - FREE</Typography>
              {/* <Button variant='contained' color='secondary' disableElevation>Post a Job</Button> */}
            </Grid>
          </Grid>
        </Box>

        <Grid container justifyContent='center' pt={2} mb={4}>
            <Grid xs={10} lg={8} container spacing={2}>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Title</InputLabel>
                    <FilledInput onChange={handleInputChange} name='title' value={jobDetails.title} autoComplete='off' inputProps={{ label: 'Job Title' }} required placeholder='Job Title *' disableUnderline fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Type</InputLabel>
                    <Select onChange={(value) => handleSelectChange(value)} name='type' value={jobDetails.type} variant='filled' disableUnderline fullWidth>
                        <MenuItem value='fulltime'>Full time</MenuItem>
                        <MenuItem value='parttime'>Part time</MenuItem>
                        <MenuItem value='contract'>Contract</MenuItem>
                    </Select>
                </Grid>

                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Name</InputLabel>
                    <FilledInput onChange={handleInputChange} name='company' value={jobDetails.company} autoComplete='off' placeholder='Company Name *' disableUnderline fullWidth sx={{ verticalAlign: 'center' }} />
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</InputLabel>
                    <FilledInput onChange={handleInputChange} name='companyUrl' value={jobDetails.companyUrl} autoComplete='off' placeholder='Company Website *' disableUnderline fullWidth />
                </Grid>

                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Location</InputLabel>
                    <Select onChange={handleSelectChange} name='location' value={jobDetails.location} variant='filled' disableUnderline fullWidth>
                        <MenuItem value='remote'>Remote</MenuItem>
                        <MenuItem value='office'>In Office</MenuItem>
                    </Select>
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Application Link</InputLabel>
                    <FilledInput onChange={handleInputChange} name='link' value={jobDetails.link} autoComplete='off' placeholder='Job Link * (URL or email)' disableUnderline fullWidth />
                </Grid>

                <Grid xs={12}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Description</InputLabel>
                    <FilledInput onChange={handleInputChange} name='description' value={jobDetails.description} placeholder='Job Description *' disableUnderline fullWidth multiline rows={4} />
                </Grid>

                <Grid xs={12}>
                    <Box mt={2}>
                        <Typography fontWeight='bold'>Skills</Typography>
                        <Box display='flex'>
                            {skills.map(skill => 
                                <Box key={skill} onClick={() => handleSkillsChange(skill)} sx={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #fff',
                                    borderColor: 'secondary.main',
                                    cursor: 'pointer',
                                    margin: 0.5,
                                    padding: 0.75,
                                    borderRadius: 1,
                                    transition: '0.3s',
                                    fontSize: '14.5px',
                                    fontWeight: 600,
                                    color: 'secondary.main',
                                    '&:hover': {
                                        backgroundColor: 'secondary.main',
                                        color: '#fff'
                                    },
                                    ...(jobDetails.skills.includes(skill) ? includedStyle : {})
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
                <Grid xs={12}>
                    <Box color='red' display='flex'>
                        <Typography variant='caption'>*Required fields</Typography>
                    </Box>
                </Grid>
                <Grid xs={12} p={0}>
                    <Box display='flex' justifyContent='center'>
                        <Grid xs={12} sm={6}>
                            <Button fullWidth disabled={loading} onClick={createJob} variant='contained' disableElevation color='primary'>
                                {loading ? <CircularProgress color='secondary' size={22} /> : 'Post job'}
                            </Button>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Grid>
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

export default Post
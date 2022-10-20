import { Box, Button, FilledInput, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node']

// TO DO:
//  Company logo, location, level (j/m/s), benefits fields
//  Text editor functions or pre-formatted sections from multiple fields
//  Cache form progress in case user accidentally navigates away
//  Request edit post link email
//  Send email with link to posting and start + end dates
//  Posting preview

const Post: NextPage = () => {
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
              <Button variant='contained' color='secondary' disableElevation>Post a Job</Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container justifyContent='center' pt={2} mb={4}>
            <Grid xs={10} lg={8} container spacing={2}>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Title</InputLabel>
                    <FilledInput inputProps={{ label: 'Job Title' }} required placeholder='Job Title *' disableUnderline fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Type</InputLabel>
                    <Select variant='filled' defaultValue='fulltime' disableUnderline fullWidth>
                        <MenuItem value='fulltime'>Full time</MenuItem>
                        <MenuItem value='parttime'>Part time</MenuItem>
                        <MenuItem value='contract'>Contract</MenuItem>
                    </Select>
                </Grid>

                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Name</InputLabel>
                    <FilledInput placeholder='Company Name *' disableUnderline fullWidth sx={{ verticalAlign: 'center' }} />
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</InputLabel>
                    <FilledInput placeholder='Company Website *' disableUnderline fullWidth />
                </Grid>

                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Location</InputLabel>
                    <Select variant='filled' defaultValue='remote' disableUnderline fullWidth>
                        <MenuItem value='remote'>Remote</MenuItem>
                        <MenuItem value='office'>In Office</MenuItem>
                    </Select>
                </Grid>
                <Grid xs={12} sm={6}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Application Link</InputLabel>
                    <FilledInput placeholder='Job Link * (URL or email)' disableUnderline fullWidth />
                </Grid>

                <Grid xs={12}>
                    <InputLabel sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Description</InputLabel>
                    <FilledInput placeholder='Job Description *' disableUnderline fullWidth multiline rows={4} />
                </Grid>

                <Grid xs={12}>
                    <Box mt={2}>
                        <Typography fontWeight='bold'>Skills</Typography>
                        <Box display='flex'>
                            {skills.map(skill => 
                                <Box key={skill} sx={{
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
                                    }
                                }}>
                                    {skill}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>

                <Grid xs={12}>
                    <Box color='red' display='flex' justifyContent='space-between'>
                        <Typography variant='caption'>*Required fields</Typography>
                        <Button variant='contained' disableElevation color='primary'>Post job</Button>
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
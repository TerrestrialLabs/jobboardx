import { Box, Button, CircularProgress, MenuItem, Select, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import jobData from '../data/test'
import { differenceInDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { database } from '../firebase/config'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

type Job = {
  id: string
  datePosted: Date
  title: string
  company: string
  companyUrl: string
  type: string
  location: string
  skills: string[]
  featured: boolean
  link: string
}

const dbInstance = collection(database, 'jobs');

const Home: NextPage = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    const req = await getDocs(query(dbInstance, orderBy('datePosted', 'desc')))
    // TO DO: Figure out typing
    const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, datePosted: doc.data().datePosted.toDate() })) as Job[]
    setJobs(jobDocs)
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>React Jobs</title>
        <meta name="description" content="Find your dream React job" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box py={10} bgcolor='primary.main' color='white'>
          <Grid container justifyContent='center'>
            <Grid xs={10} display='flex' justifyContent='space-between'>
              <Typography variant='h4'>React Jobs</Typography>
              <Button href='/post' variant='contained' color='secondary' disableElevation>Post a Job</Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container justifyContent='center'>
          <Grid xs={10}>
            <Box p={2} mt={-5} mb={2} sx={{
              backgroundColor: '#fff',
              display: 'flex',
              boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
              borderRadius: 1,
              '& > *': {
                flex: 1,
                height: 45,
                margin: 1
              }
            }}>
              <Select variant='filled' disableUnderline defaultValue='fulltime'>
                <MenuItem value='fulltime'>Full time</MenuItem>
                <MenuItem value='parttime'>Part time</MenuItem>
                <MenuItem value='contract'>Contract</MenuItem>
              </Select>
              <Select variant='filled' disableUnderline defaultValue='remote'>
                <MenuItem value='remote'>Remote</MenuItem>
                <MenuItem value='office'>In Office</MenuItem>
              </Select>
              <Button variant='contained' color='secondary' disableElevation>Search</Button>
            </Box>

            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' sx={{ minHeight: 200 }}>
                <CircularProgress />
              </Box>
              ) : (
              <Box mb={4}>
                {jobs.map((job, index) => 
                  <ListItem 
                    first={index === 0} 
                    last={index === jobs.length - 1} 
                    key={job.id} 
                    {...job} />
                )}
                {jobData.map((job, index) => 
                  <ListItem 
                    first={index === 0} 
                    last={index === jobData.length - 1} 
                    key={job.id} 
                    {...job} />
                )}
              </Box>
            )}
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

export default Home

type ListItemProps = Job & {
  first: boolean
  last: boolean
}

// TO DO: 
//  Add image url
//  If differenceInDays === 0 job is "new", else X days ago
//  Capitalize type & location
const ListItem = ({
  first,
  last,
  datePosted,
  title,
  company,
  companyUrl,
  type,
  location,
  skills,
  featured,
  link
}: ListItemProps) => {
  const difference = differenceInDays(Date.now(), datePosted)
  const differenceText = difference === 0 ? 'new' : `${difference} days ago`

  return (
    <Box p={2} sx={{ 
      border: '1px solid #e8e8e8',
      borderTopLeftRadius: first ? 4 : 0,
      borderTopRightRadius: first ? 4 : 0,
      borderBottomLeftRadius: last ? 4 : 0,
      borderBottomRightRadius: last ? 4 : 0,
      cursor: 'pointer',
      transition: '.3s',
      '&:hover': {
        boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #4d64e4',
      }
    }}>
      <Grid container alignItems='center'>
        <Grid xs container alignItems='center'>
          <Grid mr={2}>
            <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', width: '60px', backgroundColor: 'lightyellow' }}>
              <Image src="/company_logo.png" alt="Treasure Data logo" width={'40%'} height={'40%'} />
            </Box>
          </Grid>

          <Grid>
            <Typography variant='subtitle1'>{title}</Typography>
            <Typography variant='subtitle1' sx={{
              backgroundColor: 'primary.main',
              padding: 0.75,
              borderRadius: 1,
              display: 'inline-block',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#fff'
            }}
            >
              {company}
            </Typography>
          </Grid>
        </Grid>
        <Grid xs container>
          {skills.map(skill => <Grid key={skill} sx={{
            backgroundColor: 'secondary.main',
            margin: 0.5,
            padding: 0.75,
            borderRadius: 1,
            transition: '0.3s',
            cursor: 'pointer',
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#fff'
          }}>
            {skill}
          </Grid>)}
        </Grid>
        <Grid xs container direction='column' alignItems='flex-end'>
          <Grid>
            <Typography variant='caption'>{differenceText} | {type} | {location}</Typography>
          </Grid>
          <Grid>
            <Box mt={2}>
              <Button variant='outlined' href={link}>Apply</Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
import { Box, Button, CircularProgress, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { Close as CloseIcon } from '@mui/icons-material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import jobData from '../data/test'
import { differenceInDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { database } from '../firebase/config'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

export type Job = {
  id: string
  datePosted: Date
  title: string
  company: string
  companyUrl: string
  type: string
  location: string
  skills: string[]
  featured: boolean
  link: string,
  description: string
}

type Filters = {
  type: string
  location: string
}

const dbInstance = collection(database, 'jobs');

const Home: NextPage = () => {
  const [filters, setFilters] = useState<Filters>({
    type: 'fulltime',
    location: 'remote'
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersApplied, setFiltersApplied] = useState(false)

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const fetchJobs = async () => {
    setFiltersApplied(false)
    setLoading(true)
    const req = await getDocs(query(dbInstance, orderBy('datePosted', 'desc')))
    // TO DO: Figure out typing
    const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, datePosted: doc.data().datePosted.toDate() })) as Job[]
    setJobs(jobDocs)
    setLoading(false)
  }

  const searchJobs = async () => {
    setLoading(true)
    const req = await getDocs(query(dbInstance, orderBy('datePosted', 'desc'), where('type', '==', filters.type), where('location', '==', filters.location)))
    // TO DO: Figure out typing
    const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, datePosted: doc.data().datePosted.toDate() })) as Job[]
    setJobs(jobDocs)
    setLoading(false)
    setFiltersApplied(true)
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

      <Box py={1} bgcolor='primary.main' color='white' sx={{ position: 'fixed', width: '100%', zIndex: 999 }}>
          <Grid container justifyContent='center'>
              <Grid xs={10} display='flex' justifyContent='space-between'>
                  <Typography variant='h4'>React Jobs</Typography>
                  <Button href='/post' variant='contained' color='secondary' disableElevation>Post a Job</Button>
              </Grid>
          </Grid>
      </Box>

      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        {/* <Box py={10} bgcolor='primary.main' color='white'> */}
        <Grid container justifyContent='center'>
          <Grid xs={10}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ backgroundImage: 'url("/hero.jpeg")', backgroundPosition: 'center', height: 'calc(50vh - 58px)'}}>
              {/* <Grid container justifyContent='center'>
                <Grid xs={10} display='flex' justifyContent='space-between'> */}
                  {/* <Box /> */}
                  {/* <Typography variant='h4'>React Jobs</Typography>
                  <Button href='/post' variant='contained' color='primary' disableElevation>Post a Job</Button> */}
                {/* </Grid>
              </Grid> */}
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center'>
          <Grid xs={10}>
            <Box p={2} mt={-5} mb={2} sx={{
              alignItems: 'center',
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
              <Select onChange={handleFilterChange} name='type' value={filters.type} variant='filled' disableUnderline defaultValue='fulltime'>
                <MenuItem value='fulltime'>Full time</MenuItem>
                <MenuItem value='parttime'>Part time</MenuItem>
                <MenuItem value='contract'>Contract</MenuItem>
              </Select>
              <Select onChange={handleFilterChange} name='location' value={filters.location} variant='filled' disableUnderline defaultValue='remote'>
                <MenuItem value='remote'>Remote</MenuItem>
                <MenuItem value='office'>In Office</MenuItem>
              </Select>
              <Button disabled={loading} onClick={searchJobs} variant='contained' color='primary' disableElevation>Search</Button>
            </Box>

            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' sx={{ minHeight: 200 }}>
                <CircularProgress />
              </Box>
              ) : (
              <Box mb={4}>
                {filtersApplied && (
                  <Box mb={1}>
                    <Button onClick={fetchJobs}>
                      <CloseIcon style={{ marginRight: '0.25rem' }} />
                      Clear Filters
                    </Button>
                  </Box>
                )}
                {jobs.map((job, index) => 
                  <ListItem 
                    first={index === 0} 
                    last={index === jobs.length - 1} 
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
  id,
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
  link,
  description
}: ListItemProps) => {
  const router = useRouter()

  const difference = differenceInDays(Date.now(), datePosted)
  const differenceText = difference === 0 ? 'new' : `${difference} days ago`

  return (
    <Box onClick={() => router.push(`jobs/${id}`)} p={2} sx={{ 
      backgroundColor: '#fff',
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
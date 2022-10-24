import { Box, Button, CircularProgress, FilledInput, FormControl, MenuItem, Pagination, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import jobData from '../data/test'
import { getTimeDifferenceString } from '../utils/utils'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { TYPE, TYPE_MAP, LOCATION, LOCATION_MAP } from '../const/const'
import { formatSalaryRange } from '../utils/utils'
import type { JobData } from './api/jobs'
import axios from 'axios'

interface Props {
  jobsList: JobData[]
}

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

const Home: NextPage<Props> = ({ jobsList }: { jobsList: JobData[] }) => {
  const filterDefaults = {
    search: '',
    type: 'any',
    location: 'any',
    salaryMin: 0
  }

  const [filters, setFilters] = useState<Filters>(filterDefaults)
  const router = useRouter()

  const filtersApplied = Object.keys(router.query).length > 0

  const handleFilterInputChange = (e: { target: { name: any; value: any } }) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilterSelectChange = (e: SelectChangeEvent<string>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters(filterDefaults)
    router.push('/')
  }

  // const fetchJobs = async () => {
  //   setFiltersApplied(false)
  //   setLoading(true)
  //   // const req = await getDocs(query(dbInstance, orderBy('featured', 'desc'), orderBy('createdAt', 'desc')))
  //   // const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate() })) as Job[]
  //   // setJobs(jobDocs)
  //   // setJobs([])
  //   setLoading(false)
  // }

  // const searchJobs = async () => {
  //   setLoading(true)

  //   // const req = await getDocs(query(dbInstance, orderBy('featured', 'desc'), orderBy('createdAt', 'desc'), where('type', '==', filters.type), where('location', '==', filters.location), where('salaryMax', '>=', filters.salary )))
  //   // const jobDocs = req.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate() })) as Job[]
  //   // setJobs(jobDocs)
  //   // setJobs([])

  //   setLoading(false)
  //   setFiltersApplied(true)
  // }

  const searchJobs = async () => {
    let params: { [key: string]: string } = {}

    Object.keys(filters).forEach(filter => {
      const value = filters[filter as keyof Filters]
      if (value && value !== 'any') {
        params[filter] = value.toString()
      }
    })

    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

    router.push(`/?${queryString}`, { query: params })
  }

  const spinner = (
    <Box display='flex' justifyContent='center' alignItems='center' sx={{ minHeight: 200 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <div className={styles.container}>
      <Head>
        <title>React Jobs</title>
        <meta name="description" content="Find your dream React job" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
          <Grid container justifyContent='center'>
              <Grid xs={10} display='flex' justifyContent='space-between' alignContent='center'>
                  <Link href='/'><Typography  color='#fff' variant='h4' sx={{ cursor: 'pointer', textDecoration: 'none' }}>React Jobs</Typography></Link>
                  <Button sx={{ flexShrink: 0 }} href='/post' variant='contained' color='secondary' disableElevation>Post a job</Button>
              </Grid>
          </Grid>
      </Box>

      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        {/* <Box py={10} bgcolor='primary.main' color='white'> */}
        <Grid container justifyContent='center'>
          <Grid xs={12} sm={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ backgroundImage: 'linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url("/hero.jpeg")', backgroundPosition: 'center', height: 'calc(45vh - 58px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
              <Typography color='#fff' variant='h1' fontSize='48px' fontWeight='bold'>Find your dream React job</Typography>
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
          <Grid xs={12} sm={9}>
            <Box p={2} pt={4} mt={-5} mb={2} sx={{
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
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <FormControl hiddenLabel fullWidth>
                  <Typography variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Keyword</Typography>
                  <FilledInput onChange={handleFilterInputChange} name='search' value={filters.search} sx={{ height: 45 }} disableUnderline placeholder='Title, company' />
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <FormControl hiddenLabel fullWidth>
                  <Typography variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Job Type</Typography>
                  <Select sx={{ height: 45 }} onChange={handleFilterSelectChange} name='type' value={filters.type} variant='filled' disableUnderline>
                    <MenuItem value={'any'}>Any</MenuItem>
                    <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                    <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                    <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <FormControl hiddenLabel fullWidth>
                  <Typography variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Location</Typography>
                  <Select sx={{ height: 45 }} onChange={handleFilterSelectChange} name='location' value={filters.location} variant='filled' disableUnderline>
                    <MenuItem value={'any'}>Any</MenuItem>
                    <MenuItem value={LOCATION.REMOTE}>{LOCATION_MAP.remote}</MenuItem>
                    <MenuItem value={LOCATION.OFFICE}>{LOCATION_MAP.office}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <FormControl hiddenLabel fullWidth>
                  <Typography variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Salary Min.</Typography>
                  <FilledInput onChange={handleFilterInputChange} name='salaryMin' value={filters.salaryMin} type='number' sx={{ height: 45 }} disableUnderline placeholder='Salary min (USD)' inputProps={{ min: "0", max: "10000000", step: "100" }} />
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                {/* <Link href={{ pathname: '/', query: filters }} passHref> */}
                  <Button sx={{ height: '100%' }} fullWidth onClick={searchJobs} variant='contained' color='primary' disableElevation>Search</Button>
                {/* </Link> */}
              </Grid>
            </Box>

            <Box pb={4}>
              {filtersApplied && (
                <Box mb={1}>
                  <Button onClick={clearFilters}>
                    <Close style={{ marginRight: '0.25rem' }} />
                    Clear Filters
                  </Button>
                </Box>
              )}
              {jobsList.map((job, index) => 
                <ListItem 
                  key={job._id} 
                  first={index === 0} 
                  last={index === jobsList.length - 1} 
                  {...job} />
              )}

              <Box mt={2} display='flex' justifyContent='center'>
                <Pagination count={10} color='primary' />
              </Box>
            </Box>
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

type ListItemProps = JobData & {
  first: boolean
  last: boolean
}

// TO DO: 
//  Add image url
//  Capitalize type & location
const ListItem = ({
  _id,
  first,
  last,
  createdAt,
  title,
  company,
  companyUrl,
  type,
  location,
  skills,
  perks,
  featured,
  applicationLink,
  description,
  salaryMin,
  salaryMax
}: ListItemProps) => {
  const router = useRouter()

  return (
    <Box onClick={() => router.push(`jobs/${_id}`)} p={2} sx={{ 
      backgroundColor: featured ? 'lightyellow' : '#fff',
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
        <Grid xs={5} container alignItems='center'>
          <Grid mr={2}>
            <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#fff' }}>
              <Image src="/company_logo.png" alt="Treasure Data logo" width={'40%'} height={'40%'} />
            </Box>
          </Grid>

          <Grid>
            <Typography variant='subtitle1'>{title}</Typography>
            <Typography variant='subtitle1' sx={{
              // backgroundColor: 'primary.main',
              // padding: 0.75,
              // borderRadius: 1,
              // display: 'inline-block',
              fontSize: '13.5px',
              fontWeight: 600,
              // color: '#fff'
            }}
            >
              {company}
            </Typography>
          </Grid>
        </Grid>
        <Grid xs={5} container>
          <Box display='flex' flexDirection='column'>
            <Grid xs container>
              {skills.slice(0, 3).map(skill => <Grid key={skill} sx={{
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

            <Box mt={1} display='flex' alignItems='center' color='grey'>
                <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2' mr={2}>{LOCATION_MAP[location]}</Typography>

                <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type]}</Typography>

                <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid xs={2} container direction='column' alignItems='flex-end'>
          <Grid>
            {/* <Typography variant='caption'>{getTimeDifferenceString(createdAt)}</Typography> */}
          </Grid>
          <Grid>
            <Box mt={2}>
              <Button variant='outlined' href={applicationLink}>Apply</Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await axios.get('http://localhost:3000/api/jobs', { params: context.query })
  return {
    props: {
      jobsList: res.data 
    }
  }
}
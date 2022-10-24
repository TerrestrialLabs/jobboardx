import { Autocomplete, Box, Button, CircularProgress, FilledInput, FormControl, MenuItem, Pagination, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
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

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

const Home: NextPage = () => {
  const filterDefaults = {
    search: '',
    type: 'any',
    location: 'any',
    salaryMin: 0
  }

  const [jobs, setJobs] = useState<JobData[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(filterDefaults)

  const filtersApplied = Object.keys(router.query).length > 0

  const resultsPerPage = 2

  useEffect(() => {
    if (router.isReady && !jobs.length && loading) {
      fetchJobs()
      fetchJobsCount(router.query)
      setFilters({
        ...filterDefaults,
        ...router.query
      })
    }
  }, [router.isReady])

  const handleFilterInputChange = (e: { target: { name: any; value: any } }) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilterSelectChange = (e: SelectChangeEvent<string>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters(filterDefaults)
    fetchJobs(true)
    fetchJobsCount(getSearchParams(filterDefaults))
    router.push('/')
  }

  const fetchJobs = async (all?: boolean) => {
    setLoading(true)

    if (!all) {
      let params: { [key: string]: string } = {}
      Object.keys(router.query).forEach(filter => {
        const value = router.query[filter] as string
        params[filter] = value
      })
  
      const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
  
      if (queryString) {
        router.push(`/?${queryString}`, { query: params })
      }
    }

    const res = await axios.get(`http://localhost:3000/api/jobs`, { params: all ? {} : router.query })

    setJobs(res.data)
    setLoading(false)
  }

  const fetchJobsCount = async (params: any) => {
    const res = await axios.get(`http://localhost:3000/api/jobs/count`, { params })
    setTotalJobs(res.data)
  }

  const getSearchParams = (searchFilters: Filters) => {
    let params: { [key: string]: string } = {}
    
    Object.keys(searchFilters).forEach(filter => {
      const value = searchFilters[filter as keyof Filters]
      if (value && value !== 'any') {
        params[filter] = value.toString()
      }
    })

    return params
  }

  const searchJobs = async () => {
    setLoading(true)

    const params = getSearchParams(filters)

    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

    router.push(`/?${queryString}`, { query: params })

    const res = await axios.get(`http://localhost:3000/api/jobs`, { params })

    fetchJobsCount(params)

    setJobs(res.data)
    setLoading(false)
  }

  const loadMoreJobs = async () => {
    const res = await axios.get('http://localhost:3000/api/jobs', { params: { ...router.query, pageIndex: Math.ceil(jobs.length / resultsPerPage) } })
    const newJobs = await res.data
    setJobs([...jobs, ...newJobs])
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
        <Grid container justifyContent='center'>
          <Grid xs={12} sm={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ backgroundImage: 'linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url("/hero.jpeg")', backgroundPosition: 'center', height: 'calc(45vh - 58px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
              <Typography color='#fff' variant='h1' fontSize='48px' fontWeight='bold'>Find your dream React job</Typography>
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
                  {/* <Select sx={{ height: 45 }} onChange={handleFilterSelectChange} name='location' value={filters.location} variant='filled' disableUnderline>
                    <MenuItem value={'any'}>Any</MenuItem>
                    <MenuItem value={LOCATION.REMOTE}>{LOCATION_MAP.remote}</MenuItem>
                    <MenuItem value={LOCATION.OFFICE}>{LOCATION_MAP.office}</MenuItem>
                  </Select> */}
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={[]}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Movie" />}
                  />
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <FormControl hiddenLabel fullWidth>
                  <Typography variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Salary Min.</Typography>
                  <FilledInput onChange={handleFilterInputChange} name='salaryMin' value={filters.salaryMin} type='number' sx={{ height: 45 }} disableUnderline placeholder='Salary min (USD)' inputProps={{ min: "0", max: "10000000", step: "100" }} />
                </FormControl>
              </Grid>
              <Grid xs={6} sm={3} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                <Button sx={{ height: '100%' }} fullWidth onClick={searchJobs} variant='contained' color='primary' disableElevation>Search</Button>
              </Grid>
            </Box>

            {loading ? spinner : (
              <Box pb={4}>
                {filtersApplied && (
                  <Box mb={1}>
                    <Button onClick={clearFilters}>
                      <Close style={{ marginRight: '0.25rem' }} />
                      Clear Filters
                    </Button>
                  </Box>
                )}
                {jobs.map((job, index) => 
                  <ListItem 
                    key={job._id} 
                    first={index === 0} 
                    last={index === jobs.length - 1} 
                    {...job} />
                )}

                {jobs.length < totalJobs && (
                  <Box mt={4} display='flex' justifyContent='center'>
                    <Button variant='contained' onClick={loadMoreJobs}>Load More</Button>
                  </Box>
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
              fontSize: '13.5px',
              fontWeight: 600,
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
            <Typography variant='caption'>{createdAt.toString()}</Typography>
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
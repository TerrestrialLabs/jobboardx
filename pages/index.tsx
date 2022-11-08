import { Autocomplete, Box, Button, CircularProgress, createFilterOptions, FilledInput, FormControl, FormHelperText, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getTimeDifferenceString } from '../utils/utils'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { TYPE, TYPE_MAP } from '../const/const'
import { formatSalaryRange } from '../utils/utils'
import type { JobData } from './api/jobs'
import axios from 'axios'
import cities from '../data/world_cities.json'
import { useWindowSize } from '../hooks/hooks'

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

const Home: NextPage = () => {
  const filterDefaults: Filters = {
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
  const [filtersOpen, setFiltersOpen] = useState(false)

  const windowSize = useWindowSize()
  const mobile = windowSize.width && windowSize.width < 500

  // @ts-ignore
  const numFiltersSelected = Object.keys(filters).filter(key => key !== 'search' && key !== 'location' && filters[key] !== 'any' && filters[key] !== 0).length
  const numFiltersApplied = Object.keys(router.query).filter(key => key !== 'search' && key !== 'location').length
  const filtersSelected = numFiltersSelected > 0
  const filtersApplied = numFiltersApplied > 0

  const resultsPerPage = 10

  // TO DO: Testing
  const testingDeleteBackfilledJobs = async () => {
    await axios.delete('http://localhost:3000/api/jobs')
  }

  // TO DO: DANGEROUS!!!
  // useEffect(() => {
  //   testingDeleteBackfilledJobs()
  // }, [])

  useEffect(() => {
    if (router.isReady && !jobs.length && loading && !!window) {
      const initialFilters = {
        ...filterDefaults,
        ...router.query
      }
      fetchJobs()
      fetchJobsCount(router.query)
      setFilters(initialFilters)
    }
  }, [router.isReady])

  const handleFilterInputChange = (e: { target: { name: any; value: any } }) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilterSelectChange = (e: SelectChangeEvent<string | number>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleAutocompleteChange = (value: string) => {
    setFilters({ ...filters, location: value })
  }

  const clearFilters = (mobile: boolean) => {
    const filtersToKeep = {
      search: filters.search,
      location: filters.location
    }
    const updatedFilters = {
      ...filterDefaults,
      ...filtersToKeep
    }
    setFilters(updatedFilters)

    if (!mobile) {
      searchJobs(updatedFilters)
    }
  }

  const fetchJobs = async () => {
    setLoading(true)

    let params: { [key: string]: string } = {}
    Object.keys(router.query).forEach((filter) => {
      const value = router.query[filter] as string
      params[filter] = value
    })

    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    if (queryString) {
      router.push(`/?${queryString}`, { query: params })
    }

    const res = await axios.get(`http://localhost:3000/api/jobs`, { params: router.query })

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

  const searchJobs = async (filters: Filters) => {
    setLoading(true)

    const params = getSearchParams(filters)

    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

    router.push(`/?${queryString}`, { query: params })

    const res = await axios.get(`http://localhost:3000/api/jobs`, { params })

    setFiltersOpen(false)
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
              <Grid xs={11} sm={10} display='flex' justifyContent='space-between' alignContent='center'>
                  <Link href='/'><Typography  color='#fff' variant='h4' sx={{ cursor: 'pointer', textDecoration: 'none' }}>React Jobs</Typography></Link>
                  <Button sx={{ flexShrink: 0 }} href='/post' variant='contained' color='secondary' disableElevation>Post a job</Button>
              </Grid>
          </Grid>
      </Box>

      {filtersOpen ? (
        <FiltersPanel 
          filters={filters}
          handleFilterInputChange={handleFilterInputChange}
          handleFilterSelectChange={handleFilterSelectChange}
          setFiltersOpen={setFiltersOpen}
          search={() => searchJobs(filters)}
        />
      ) :
      (<main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        <Grid container justifyContent='center'>
          <Grid xs={12} sm={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ backgroundImage: 'linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url("/hero.jpeg")', backgroundPosition: 'center', height: 'calc(45vh - 58px)', display: 'flex', justifyContent: 'center', alignItems: mobile ? 'center' : 'flex-end'}}>
              <Typography textAlign='center' color='#fff' variant='h1' fontSize={mobile ? '36px' : '48px'} fontWeight='bold'>Find your dream React job</Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center'>
          <Grid xs={11} sm={9}>
            <Box p={2} pt={2} mt={-5} mb={2} sx={{
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
              borderRadius: 1,
              '& > *': {
                flex: 1,
                height: 45,
                margin: 1
              }
            }}>
             {mobile ? (
                <Box>
                    <Grid mb={2} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                      <FormControl hiddenLabel fullWidth>
                        <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Keyword</Typography>
                        <FilledInput autoComplete='off' onChange={handleFilterInputChange} name='search' value={filters.search} sx={{ height: 45 }} disableUnderline placeholder='Title, company' />
                      </FormControl>
                    </Grid>
                    <Grid mb={2} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                      <FormControl hiddenLabel fullWidth>
                        <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Location</Typography>
                        <Autocomplete
                          disablePortal
                          renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: 'Location', style: { padding: '4px 12px 4px' }}} />}
                          options={cities}
                          filterOptions={createFilterOptions({
                              limit: 10
                          })}
                          onChange={(e, value) => handleAutocompleteChange(value || '')}
                          value={filters.location}
                        />
                      </FormControl>
                    </Grid>

                    <Box display='flex' mb={2}>
                      <Typography onClick={() => setFiltersOpen(true)} color='primary.main' variant='caption'>{`Filters (${numFiltersSelected})`}</Typography>
                      {filtersSelected && <Typography ml={1} onClick={() => clearFilters(true)} color='grey' variant='caption'>Clear</Typography>}
                    </Box>

                    <Grid sx={{ display: 'flex', alignItems: 'flex-end'}}>
                      <Button sx={{ height: '45px' }} fullWidth onClick={() => searchJobs(filters)} variant='contained' color='primary' disableElevation>Search</Button>
                    </Grid>
                </Box>
              ) : (
                <Box>
                  <Box display='flex'>
                      <Grid xs={5} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                        <FormControl hiddenLabel fullWidth sx={{ marginRight: 2 }}>
                          <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Keyword</Typography>
                          <FilledInput autoComplete='off' onChange={handleFilterInputChange} name='search' value={filters.search} sx={{ height: 45 }} disableUnderline placeholder='Title, company' />
                        </FormControl>
                      </Grid>
                      <Grid xs={5} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                        <FormControl hiddenLabel fullWidth sx={{ marginRight: 2 }}>
                          <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Location</Typography>
                          <Autocomplete
                            disablePortal
                            renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: 'Location', style: { padding: '4px 12px 4px' }}} />}
                            options={cities}
                            filterOptions={createFilterOptions({
                                limit: 10
                            })}
                            onChange={(e, value) => handleAutocompleteChange(value || '')}
                            value={filters.location}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={2} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                        <Button sx={{ height: '45px' }} fullWidth onClick={() => searchJobs(filters)} variant='contained' color='primary' disableElevation>Search</Button>
                      </Grid>
                    </Box>

                    <Box mt={2}>
                      <Grid container>
                        <Grid xs={5} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                          <FormControl hiddenLabel fullWidth sx={{ marginRight: 2 }}>
                            <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Job Type</Typography>
                            <Select sx={{ height: 45 }} onChange={handleFilterSelectChange} name='type' value={filters.type} variant='filled' disableUnderline>
                              <MenuItem value={'any'}>Any</MenuItem>
                              <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                              <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                              <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid xs={5} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                          <SalaryField onChange={handleFilterSelectChange} value={filters.salaryMin} />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              {/* <Box display='flex'>
                <Typography color='primary.main' variant='caption'>Filters (2)</Typography>
              </Box> */}
            </Box>

            {loading ? spinner : (
              <Box pb={4}>
                {filtersApplied && !mobile && (
                  <Box mb={1}>
                    <Button onClick={() => clearFilters(false)}>
                      <Close style={{ marginRight: '0.25rem' }} />
                      Clear Filters
                    </Button>
                  </Box>
                )}
                {jobs.map((job, index) => mobile ? 
                  <ListItemMobile
                    key={job._id} 
                    first={index === 0} 
                    last={index === jobs.length - 1} 
                    {...job} 
                  />
                 : 
                  <ListItem
                    key={job._id} 
                    first={index === 0} 
                    last={index === jobs.length - 1} 
                    {...job} 
                  />
                )}

                {!jobs.length && <Typography textAlign='center'>No jobs found</Typography>}

                {jobs.length < totalJobs && (
                  <Box mt={4} display='flex' justifyContent='center'>
                    <Button variant='contained' onClick={loadMoreJobs}>Load More</Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </main>)}

      <EmailFooter />

      {!filtersOpen && (
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
      )}
    </div>
  )
}

export default Home

const EmailFooter = () => {
  const [open, setOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const windowSize = useWindowSize()
  const mobile = windowSize.width && windowSize.width < 500

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

  const createSubscription = async () => {
      setLoading(true)
      if (!validate()) {
          setError(true)
          setLoading(false)
          return
      }
      setError(false)
      await axios.post(`http://localhost:3000/api/subscriptions`, { email })
      setLoading(false)
      setSubmitted(true)
  }

  if (!open) {
    return null
  }

  if (mobile) {
    return (
      <Grid container>
        <Grid xs={11}>
          <Box sx={{ backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', zIndex: 999 }} padding='1rem' width='100%' display='flex' alignItems='center' justifyContent='center' position='fixed' bottom={0}>
            <IconButton onClick={() => setOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
              <Close />
            </IconButton>
            {submitted ? (
              <>
                <Typography color='success.main'>
                  Success! You'll be receiving job alerts to your inbox soon.
                </Typography>
              </>
              ) : (
              <Box display='flex' flexDirection='column' width='100%'>
                <Typography>Get the best jobs right in your inbox</Typography>
                <Grid xs={12}>
                  <Box display='flex' mt={1}>
                    <FormControl hiddenLabel fullWidth>
                      <FilledInput placeholder='Your email address' error={error} disableUnderline={!error} sx={{ marginRight: '1rem', height: '45px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                      {error && <FormHelperText error>Invalid email address</FormHelperText>}
                    </FormControl>
                    <Button onClick={createSubscription} variant='contained' disableElevation sx={{ height: '45px' }}>
                      {loading ? <CircularProgress color='secondary' size={22} /> : 'Subscribe'}
                    </Button>
                  </Box>
                </Grid>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box color='primary.main' sx={{ backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', zIndex: 999 }} padding='1rem' width='100%' height='78px' display='flex' alignItems='center' justifyContent='center' position='fixed' bottom={0}>
        <IconButton onClick={() => setOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
          <Close />
        </IconButton>
        {submitted ? (
          <>
            <Typography color='success.main'>
              Success! You'll be receiving job alerts to your inbox soon.
            </Typography>
          </>
          ) : (
          <>
            <Typography mr={'1rem'}>Get the best jobs right in your inbox</Typography>
            <FormControl hiddenLabel>
              <FilledInput placeholder='Your email address' error={error} disableUnderline={!error} sx={{ marginRight: '1rem', height: '45px', width: '225px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && <FormHelperText error>Invalid email address</FormHelperText>}
            </FormControl>
            <Button onClick={createSubscription} variant='contained' disableElevation sx={{ height: '45px' }}>
              {loading ? <CircularProgress color='secondary' size={22} /> : 'Subscribe'}
            </Button>
          </>
        )}
      </Box>
  )
}

type ListItemProps = JobData & {
  first: boolean
  last: boolean
}
const ListItem = ({
  _id,
  first,
  last,
  createdAt,
  datePosted,
  title,
  company,
  companyLogo,
  type,
  location,
  remote,
  skills,
  featured,
  applicationLink,
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
            <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
              {companyLogo && <img style={{ borderRadius: '50%' }} src={companyLogo} alt="Company logo" width={'100%'} height={'100%'} />}
              {!companyLogo && <Typography fontSize={20}>{company.slice(0, 1).toUpperCase()}</Typography>}
            </Box>
          </Grid>

          <Grid>
            <Typography variant='subtitle1' sx={{ fontWeight: '600' }}>{title}</Typography>
            <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{company}</Typography>
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
                <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>

                <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>

                <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid xs={2} container direction='column' alignItems='flex-end'>
          <Grid>
            {/* TO DO: Phase out createdAt when all jobs have datePosted */}
            <Typography variant='caption'>{getTimeDifferenceString(datePosted || createdAt)}</Typography>
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

const ListItemMobile = ({
  _id,
  first,
  last,
  createdAt,
  datePosted,
  title,
  company,
  companyLogo,
  type,
  location,
  remote,
  skills,
  perks,
  featured,
  applicationLink,
  salaryMin,
  salaryMax
}: ListItemProps) => {
  const router = useRouter()

  return (
    <Box onClick={() => router.push(`jobs/${_id}`)} p={2} mb={2} sx={{ 
      backgroundColor: featured ? 'lightyellow' : '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: '.3s',
      '&:hover': {
        boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #4d64e4',
      }
    }}>
      <Box>
        <Grid container>
          {companyLogo && (<Grid xs={2}>
            <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
              <img style={{ borderRadius: '50%' }} src={companyLogo} alt="Company logo" width={'100%'} height={'100%'} />
            </Box>
          </Grid>)}

          <Grid xs={companyLogo ? 10 : 12}>
            <Box sx={{ marginLeft: companyLogo ? 2 : 0 }}>
              <Typography variant='subtitle1' sx={{ fontSize: '18px', fontWeight: '600' }}>{title}</Typography>
              <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{company}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box mt={1} display='flex' flexWrap='wrap'>
        <Box display='flex' alignItems='center' color='grey'>
          <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>
        </Box>

        <Box display='flex' alignItems='center' color='grey'>
          <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>
        </Box>

        <Box display='flex' alignItems='center' color='grey'>
          <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
        </Box>
      </Box>

      <Box mt={1}>
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
      </Box>

      <Box mt={0.25}>
        <Grid xs container>
          {perks.slice(0, 3).map(perk => <Grid key={perk} sx={{
            backgroundColor: '#e74c3c',
            margin: 0.5,
            padding: 0.75,
            borderRadius: 1,
            transition: '0.3s',
            cursor: 'pointer',
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#fff'
          }}>
            {perk}
          </Grid>)}
        </Grid>
      </Box>

      <Box mt={2} display='flex' justifyContent='space-between' alignItems='center'>
        <Button sx={{ width: '100px' }} variant='outlined' href={applicationLink}>Apply</Button>
        <Typography variant='caption'>{getTimeDifferenceString(datePosted || createdAt)}</Typography>
      </Box>
    </Box>
  )
}

type FiltersPanelProps = {
  filters: Filters
  handleFilterInputChange: (e: { target: { name: any; value: any } }) => void
  handleFilterSelectChange: (e: SelectChangeEvent<string | number>) => void
  setFiltersOpen: Dispatch<SetStateAction<boolean>>
  search: () => void
}
const FiltersPanel = ({ filters, handleFilterInputChange, handleFilterSelectChange, setFiltersOpen, search }: FiltersPanelProps) => {
  return (
    <Box sx={{ paddingTop: '58px', position: 'relative' }}>
      <IconButton onClick={() => setFiltersOpen(false)} style={{ position: 'absolute', top: '62px', right: '0.25rem' }}>
        <Close />
      </IconButton>

      <Grid container justifyContent='center' paddingTop='1.5rem' paddingBottom='1rem'>
        <Grid xs={11} container justifyContent='center'>
          <Grid mb={2} xs={12} sx={{ display: 'flex' }}>
            <FormControl hiddenLabel fullWidth>
              <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Job Type</Typography>
              <Select sx={{ height: 45 }} onChange={handleFilterSelectChange} name='type' value={filters.type} variant='filled' disableUnderline>
                <MenuItem value={'any'}>Any</MenuItem>
                <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid mb={4} xs={12} sx={{ display: 'flex' }}>
            <SalaryField mobile onChange={handleFilterSelectChange} value={filters.salaryMin} />
          </Grid>

          <Grid xs={12} sx={{ display: 'flex' }}>
            <Button sx={{ height: '45px' }} fullWidth onClick={search} variant='contained' color='primary' disableElevation>Search</Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

type SalaryFieldProps = {
  mobile?: boolean
  onChange: (e: SelectChangeEvent<string | number>) => void
  value: number
}
const SalaryField = ({ mobile, onChange, value }: SalaryFieldProps) => {
  return (
    <FormControl hiddenLabel fullWidth sx={{ marginRight: mobile ? 0 : 2 }}>
      <Typography fontWeight='bold' variant='subtitle2' sx={{ marginBottom: '0.25rem' }}>Salary Min. (USD)</Typography>
      <Select sx={{ height: 45 }} onChange={onChange} name='salaryMin' value={value} variant='filled' disableUnderline>
        <MenuItem value={0}>Any</MenuItem>
        <MenuItem value={30000}>$30,000+</MenuItem>
        <MenuItem value={35000}>$35,000+</MenuItem>
        <MenuItem value={40000}>$40,000+</MenuItem>
        <MenuItem value={50000}>$50,000+</MenuItem>
        <MenuItem value={60000}>$60,000+</MenuItem>
        <MenuItem value={70000}>$70,000+</MenuItem>
        <MenuItem value={80000}>$80,000+</MenuItem>
        <MenuItem value={90000}>$90,000+</MenuItem>
        <MenuItem value={100000}>$100,000+</MenuItem>
        <MenuItem value={110000}>$110,000+</MenuItem>
        <MenuItem value={120000}>$120,000+</MenuItem>
        <MenuItem value={130000}>$130,000+</MenuItem>
        <MenuItem value={140000}>$140,000+</MenuItem>
        <MenuItem value={150000}>$150,000+</MenuItem>
        <MenuItem value={175000}>$175,000+</MenuItem>
        <MenuItem value={200000}>$200,000+</MenuItem>
        <MenuItem value={250000}>$250,000+</MenuItem>
        <MenuItem value={300000}>$300,000+</MenuItem>
      </Select>
    </FormControl>
  )
}
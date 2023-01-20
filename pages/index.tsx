import { Autocomplete, Box, Button, CircularProgress, createFilterOptions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FilledInput, FormControl, FormHelperText, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getTimeDifferenceString } from '../utils/utils'
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AUTH_STATUS, TYPE, TYPE_MAP } from '../const/const'
import { formatSalaryRange } from '../utils/utils'
import axios from 'axios'
import cities from '../data/world_cities_options.json'
import { useWindowSize } from '../hooks/hooks'
import EmailFooter from '../components/EmailFooter'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { ListItem, ListItemMobile } from '../components/ListItem'
import { JobData } from '../models/Job'
import { FiltersPanel, SalaryField } from '../components/jobs/FiltersPanel'
import { useSession } from '../context/SessionContext'
import axiosInstance from '../api/axios'

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

const JobsList = () => {
  const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

  const filterDefaults: Filters = {
    search: '',
    type: 'any',
    location: '',
    salaryMin: 0
  }

  const [jobs, setJobs] = useState<JobData[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(filterDefaults)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const windowSize = useWindowSize()
  const mobile = !!(windowSize.width && windowSize.width < 500 )

  // @ts-ignore
  const numFiltersSelected = Object.keys(filters).filter(key => key !== 'search' && key !== 'location' && filters[key] !== 'any' && filters[key] !== 0).length
  const numFiltersApplied = Object.keys(router.query).filter(key => key !== 'search' && key !== 'location').length
  const filtersSelected = numFiltersSelected > 0
  const filtersApplied = numFiltersApplied > 0

  const resultsPerPage = 10

  const trackJobApplyClick = ({ jobId, subtype }: { jobId: string, subtype: string }) => {
    axios.post(`${baseUrlApi}analytics/job-apply-clicks`, { jobId, subtype })
  }

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

    const res = await axios.get(`${baseUrlApi}jobs`, { params: { ...router.query, jobboardId: jobboard._id } })

    setJobs(res.data)
    setLoading(false)
  }

  const fetchJobsCount = async (params: any) => {
    const res = await axios.get(`${baseUrlApi}jobs/count`, { params: { ...params, jobboardId: jobboard._id } })
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

    const res = await axios.get(`${baseUrlApi}jobs`, { params: { ...params, jobboardId: jobboard._id } })

    setFiltersOpen(false)
    fetchJobsCount(params)
    setJobs(res.data)
    setLoading(false)
  }

  const loadMoreJobs = async () => {
    const res = await axios.get(`${baseUrlApi}jobs`, { params: { ...router.query, jobboardId: jobboard._id, pageIndex: Math.ceil(jobs.length / resultsPerPage) } })
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
        <title>{jobboard.title}</title>
        <meta name="description" content="Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {filtersOpen && (
        <FiltersPanel 
          open={filtersOpen}
          filters={filters}
          handleFilterInputChange={handleFilterInputChange}
          handleFilterSelectChange={handleFilterSelectChange}
          setFiltersOpen={setFiltersOpen}
          search={() => searchJobs(filters)}
        />
      )}

      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        <Grid container justifyContent='center'>
          <Grid xs={12} sm={10} lg={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image priority={true} style={{ zIndex: 0, height: '100%', width: '100%', opacity: 1 }} alt='Hero image' src={jobboard.heroImage} layout='fill' objectFit='cover' objectPosition='center' />
              <Box p={2} pb={mobile ? '60px' : '50px'} sx={{ zIndex: 1 }}>
                <Typography mb={2} textAlign='center' color='#fff' variant='h1' fontSize={mobile ? '36px' : '48px'} fontWeight='bold'>{jobboard.homeTitle}</Typography>
                <Typography textAlign='center' color='#fff' variant='h2' fontSize={mobile ? '26px' : '32px'}>{jobboard.homeSubtitle}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center' sx={{ position: 'relative' }}>
          <Grid xs={11} sm={10} lg={9}>
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
                          autoSelect
                          disablePortal
                          renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: 'Location', style: { padding: '4px 12px 4px' }}} />}
                          options={cities}
                          filterOptions={createFilterOptions({
                              limit: 10
                          })}
                          onChange={(e, value) => handleAutocompleteChange(value || '')}
                          value={filters.location ? filters.location : null}
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
                            autoSelect
                            disablePortal
                            renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: 'Location', style: { padding: '4px 12px 4px' }}} />}
                            options={cities}
                            filterOptions={createFilterOptions({
                                limit: 10
                            })}
                            onChange={(e, value) => handleAutocompleteChange(value || '')}
                            value={filters.location ? filters.location : null}
                          />
                        </FormControl>
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
                        <Grid xs={2} sx={{ display: 'flex', alignItems: 'flex-end'}}>
                          <Button sx={{ height: '45px' }} fullWidth onClick={() => searchJobs(filters)} variant='contained' color='primary' disableElevation>Search</Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
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
                    trackJobApplyClick={trackJobApplyClick}
                    {...job} 
                  />
                 : 
                  <ListItem
                    key={job._id} 
                    first={index === 0} 
                    last={index === jobs.length - 1}
                    trackJobApplyClick={trackJobApplyClick}
                    {...job} 
                  />
                )}

                {!jobs.length && <Box mt={4}><Typography textAlign='center'>No jobs found</Typography></Box>}

                {jobs.length < totalJobs && (
                  <Box mt={4} display='flex' justifyContent='center'>
                    <Button sx={{ height: '45px' }} disableElevation variant='contained' onClick={loadMoreJobs}>Load More</Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </main>

      <EmailFooter />
    </div>
  )
}

const Home: NextPage = () => {
  const { baseUrl, baseUrlApi, jobboard, isAdminSite } = useContext(JobBoardContext) as JobBoardContextValue
  const session = useSession()
  
  const [adminMessage, setAdminMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (baseUrlApi.startsWith('http://localhost') && !jobboard) {
      setAdminMessage('Please create a default job board in the admin panel.')
    }
  }, [])

  useEffect(() => {
    if (isAdminSite && session.status !== AUTH_STATUS.LOADING) {
      redirect()
    }
  }, [session.status])

  const redirect = async () => {
    if (session.status === AUTH_STATUS.AUTHENTICATED) {
      const { data } = await axiosInstance.get(`${baseUrlApi}jobboards/admin`)
      if (data.length) {
        router.push('/admin')
      } else {
        router.push('/admin/create-board')
      }
    } else {
      router.push('/login')
    }
  }

  if (isAdminSite) {
    return (
      <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
          <CircularProgress color='secondary' size={22} />
      </Box>
    )
  }

  if (!jobboard) {
    return <Box p={4} pt={12}><Typography textAlign='center'>Please create a default job board in the admin panel.</Typography></Box>
  }

  return <JobsList />
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}
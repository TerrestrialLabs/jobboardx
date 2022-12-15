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
import { TYPE, TYPE_MAP } from '../const/const'
import { formatSalaryRange } from '../utils/utils'
import axios from 'axios'
import cities from '../data/world_cities.json'
import { useWindowSize } from '../hooks/hooks'
import EmailFooter from '../components/EmailFooter'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { ListItem, ListItemMobile } from '../components/ListItem'
import { JobData } from '../models/Job'

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

const Home: NextPage = () => {
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

  // TO DO: Testing
  // const testingDeleteBackfilledJobs = async () => {
  //   await axios.delete(`${baseUrlApi}jobs`)
  // }

  // TO DO: DANGEROUS!!!
  // useEffect(() => {
  //   testingDeleteBackfilledJobs()
  // }, [])

  const trackJobApplyClick = ({ jobId, subtype }: { jobId: string, subtype: string }) => {
    axios.post(`${baseUrlApi}analytics/job-apply-clicks`, { jobId, subtype })
  }

  // When filters panel open on mobile don't allow scroll
  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [filtersOpen])

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
          <Grid xs={12} sm={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ position: 'relative', height: 'calc(45vh - 58px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image priority={true} style={{ zIndex: 0, height: '100%', width: '100%', opacity: 0.6 }} alt='Hero image' src={jobboard.heroImage} layout='fill' objectFit='cover' objectPosition='center' />
              <Box sx={{ zIndex: 1 }}>
                <Typography mb={2} textAlign='center' color='#fff' variant='h1' fontSize={mobile ? '36px' : '48px'} fontWeight='bold'>{jobboard.homeTitle}</Typography>
                <Typography textAlign='center' color='#fff' variant='h2' fontSize={mobile ? '26px' : '32px'}>{jobboard.homeSubtitle}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center' sx={{ position: 'relative' }}>
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

                {!jobs.length && <Typography textAlign='center'>No jobs found</Typography>}

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

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}

type FiltersPanelProps = {
  open: boolean
  filters: Filters
  handleFilterInputChange: (e: { target: { name: any; value: any } }) => void
  handleFilterSelectChange: (e: SelectChangeEvent<string | number>) => void
  setFiltersOpen: Dispatch<SetStateAction<boolean>>
  search: () => void
}
const FiltersPanel = ({ open, filters, handleFilterInputChange, handleFilterSelectChange, setFiltersOpen, search }: FiltersPanelProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  
  if (!open) {
    return null
  }

  const close = () => setFiltersOpen(false)

  return (
    <Dialog
        fullScreen={fullScreen}
        open
        onClose={close}
        aria-labelledby="responsive-dialog-title"
    >
        <DialogTitle>
            <Typography fontSize='20px' fontWeight='bold'>Search filters</Typography>
            <IconButton
                aria-label="close"
                onClick={close}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <Close />
            </IconButton>
        </DialogTitle>
          <Grid container justifyContent='center'>
            <Grid p={3} pt={0} xs={12} container>
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
            </Grid>
          </Grid>
        <DialogContent>
          
        </DialogContent>

        <DialogActions sx={{ padding: 3, display: 'flex', flexDirection: 'column' }}>
            <Button sx={{ marginBottom: 2 }} fullWidth disableElevation variant='contained' color='primary' onClick={search}>
                Search
            </Button>
            <Button fullWidth disableElevation color='primary' onClick={close}>
                Close
            </Button>
        </DialogActions>
    </Dialog>
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
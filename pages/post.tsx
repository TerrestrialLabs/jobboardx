import { Box, Button, CircularProgress, FilledInput, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import type { JobData } from './api/jobs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LOCATION, LOCATION_MAP, PERKS, SKILLS, TYPE, TYPE_MAP } from '../const/const'
import axios from 'axios'

export type PostForm = {
    title: string
    company: string
    companyUrl: string
    type: string
    location: string
    skills: string[]
    perks: string[]
    description: string
    featured: boolean
    applicationLink: string
    salaryMin: number
    salaryMax: number
}

const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node']
const perks = [
    'WFH', 
    'Unlimited PTO',
    'Health insurance', 
    'Dental insurance', 
    'Vision insurance',
    'Parental leave',
    'Gym membership'
]

const includedSkillStyle = {
    backgroundColor: 'secondary.main',
    color: '#fff'
}

const includedPerkStyle = {
    backgroundColor: '#e74c3c',
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

const Post: NextPage = () => {
    const [jobDetails, setJobDetails] = useState<PostForm>({
        title: '',
        company: '',
        companyUrl: '',
        type: TYPE.FULLTIME,
        location: LOCATION.REMOTE,
        description: '',
        applicationLink: '',
        skills: [],
        perks: [],
        salaryMin: 0,
        salaryMax: 0,
        // TO DO: Hardcoded
        featured: false
    })
    const [descriptionValue, setDescriptionValue] = useState('');
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
        // TO DO: Make sure minSalary is not higher than maxSalary
        // TO DO: Make sure minSalary and maxSalary are above $0
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:3000/api/jobs', { 
                ...jobDetails,
                title: jobDetails.title.trim(),
                company: jobDetails.company.trim(),
                companyUrl: jobDetails.companyUrl.trim(),
                description: jobDetails.description.trim(),
                applicationLink: jobDetails.applicationLink.trim()
            })
            res.status === 201 && router.push(`/jobs/${res.data._id}`)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleMultipleSelectChange = (e: SelectChangeEvent<string[]>) => {
        console.log(e.target.value)
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value as string[] })
    }
    
  return (
    <div className={styles.container}>
      <Head>
        <title>React Jobs | Post a job</title>
        <meta name="description" content="Post a job" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
          <Grid container justifyContent='center'>
              <Grid xs={10} display='flex' justifyContent='space-between' alignContent='center'>
                  <Link href='/'><Typography  color='#fff' variant='h4' sx={{ cursor: 'pointer', textDecoration: 'none' }}>React Jobs</Typography></Link>
                  <Button sx={{ flexShrink: 0 }} href='/' variant='contained' color='secondary' disableElevation>All jobs</Button>
              </Grid>
          </Grid>
      </Box>

      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        <Grid container justifyContent='center' pt={2} pb={4}>
            <Grid xs={10} lg={9} p={2}>
                <Box p={4} sx={{ backgroundColor: 'lightyellow', borderRadius: 1 }}>
                    <Typography mb={1} variant='h1' fontWeight='bold' fontSize={30}>Post a job</Typography>
                    <Typography variant='h2' fontSize={18} color='grey'>Hire the best React developers for an affordable price.</Typography>
                </Box>
            </Grid>

            <Grid xs={10} lg={9} p={2} container>
                <Grid xs={8} container>
                    <Box p={4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Title</Typography>
                                    <FilledInput onChange={handleInputChange} name='title' value={jobDetails.title} autoComplete='off' inputProps={{ label: 'Job Title' }} required placeholder='Job Title *' disableUnderline fullWidth />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Type</Typography>
                                    <Select onChange={(value) => handleSelectChange(value)} name='type' value={jobDetails.type} variant='filled' disableUnderline fullWidth>
                                        <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                                        <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                                        <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Salary Range <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                    <Box display='flex' alignItems='center'>
                                        <FilledInput type='number' fullWidth onChange={handleInputChange} name='salaryMin' value={jobDetails.salaryMin} autoComplete='off' required placeholder='Min *' disableUnderline sx={{ marginRight: '0.25rem' }}  inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                        <Typography sx={{ marginRight: '0.25rem' }}>{' - '}</Typography>
                                        <FilledInput type='number' fullWidth onChange={handleInputChange} name='salaryMax' value={jobDetails.salaryMax} autoComplete='off' required placeholder='Max *' disableUnderline inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                    </Box>
                                </FormControl>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Name</Typography>
                                    <FilledInput onChange={handleInputChange} name='company' value={jobDetails.company} autoComplete='off' placeholder='Company Name *' disableUnderline fullWidth sx={{ verticalAlign: 'center' }} />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</Typography>
                                    <FilledInput onChange={handleInputChange} name='companyUrl' value={jobDetails.companyUrl} autoComplete='off' placeholder='Company Website *' disableUnderline fullWidth />
                                </FormControl>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Location</Typography>
                                    <Select onChange={handleSelectChange} name='location' value={jobDetails.location} variant='filled' disableUnderline fullWidth>
                                        <MenuItem value={LOCATION.REMOTE}>{LOCATION_MAP.remote}</MenuItem>
                                        <MenuItem value={LOCATION.OFFICE}>{LOCATION_MAP.office}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Application Link</Typography>
                                    <FilledInput onChange={handleInputChange} name='applicationLink' value={jobDetails.applicationLink} autoComplete='off' placeholder='URL or email *' disableUnderline fullWidth />
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Description</Typography>
                                    <FilledInput onChange={handleInputChange} name='description' value={jobDetails.description} placeholder='Job Description *' disableUnderline fullWidth multiline rows={8} />
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills</Typography>
                                    <Select placeholder='CSS, HTML, JavaScript' multiple onChange={handleMultipleSelectChange} name='skills' value={jobDetails.skills} variant='filled' disableUnderline fullWidth renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip color='secondary.main' value={value} />
                                            ))}
                                        </Box>
                                    )}>
                                        {SKILLS.map(skill => <MenuItem key={skill} value={skill}>{skill}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Perks</Typography>
                                    <Select placeholder='Unlimited vacation, 401k matching' multiple onChange={handleMultipleSelectChange} name='perks' value={jobDetails.perks} variant='filled' disableUnderline fullWidth renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip color='red' value={value} />
                                            ))}
                                        </Box>
                                    )}>
                                        {PERKS.map(perk => <MenuItem key={perk} value={perk}>{perk}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* <Grid xs={12}>
                                <Box>
                                    <Typography fontWeight='bold'>Skills</Typography>
                                    <Box display='flex' flexWrap='wrap'>
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
                                                ...(jobDetails.skills.includes(skill) ? includedSkillStyle : {})
                                            }}>
                                                {skill}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid xs={12}>
                                <Box>
                                    <Typography fontWeight='bold'>Perks</Typography>
                                    <Box display='flex' flexWrap='wrap'>
                                        {perks.map(perk => 
                                            <Box key={perk} onClick={() => handlePerksChange(perk)} sx={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e74c3c',
                                                borderColor: '#e74c3c',
                                                cursor: 'pointer',
                                                margin: 0.5,
                                                padding: 0.75,
                                                borderRadius: 1,
                                                transition: '0.3s',
                                                fontSize: '14.5px',
                                                fontWeight: 600,
                                                color: '#e74c3c',
                                                '&:hover': {
                                                    backgroundColor: '#e74c3c',
                                                    color: '#fff'
                                                },
                                                ...(jobDetails.perks.includes(perk) ? includedPerkStyle : {})
                                            }}>
                                                {perk}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Grid> */}

                            {/* <Grid xs={12}>
                                <Box color='red' display='flex'>
                                    <Typography variant='caption'>*Required fields</Typography>
                                </Box>
                            </Grid> */}

                            <Grid xs={12} p={0}>
                                <Box mt={2} display='flex' justifyContent='center'>
                                    <Grid xs={12} sm={6}>
                                        <Button fullWidth disabled={loading} onClick={createJob} variant='contained' disableElevation color='primary'>
                                            {loading ? <CircularProgress color='secondary' size={22} /> : 'Post job'}
                                        </Button>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                        </Box>
                </Grid>

                <Grid xs={4}>
                    <Box ml={4} mb={4} p={4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column'>
                        <Typography>Your job will be seen by <strong>12,782</strong> professionals.</Typography>
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

const Chip = ({ color, value }: { color: string, value: string }) => {
    return (
        <Box key={value} sx={{
            backgroundColor: color === 'red' ? '#e74c3c' : 'secondary.main',
            border: `1px solid ${color === 'red' ? '#e74c3c' : 'secondary.main'}`,
            cursor: 'pointer',
            margin: 0.5,
            padding: 0.75,
            borderRadius: 1,
            transition: '0.3s',
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#fff'
        }}>
            {value}
        </Box>
    )
}
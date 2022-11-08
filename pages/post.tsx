import { Alert, Autocomplete, Box, Button, Checkbox, CircularProgress, createFilterOptions, FilledInput, FormControl, FormHelperText, Input, InputLabel, makeStyles, MenuItem, Select, SelectChangeEvent, TextField, Theme, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useState } from 'react'
import styles from '../styles/Home.module.css'
import type { JobData } from './api/jobs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PERKS, SKILLS, TYPE, TYPE_MAP } from '../const/const'
import axios from 'axios'
import cities from '../data/world_cities.json'
import TextEditor from '../components/post/TextEditor'
import { serialize } from '../utils/serialize'
import { useWindowSize } from '../hooks/hooks'

export type PostForm = {
    title: string
    company: string
    companyUrl: string
    companyLogo: string
    type: string
    location: string
    remote: boolean
    skills: string[]
    perks: string[]
    featured: boolean
    applicationLink: string
    salaryMin: number
    salaryMax: number
}

// TO DO:
//  Level (j/m/s) field
//  Text editor functions or pre-formatted sections from multiple fields
//  Request edit post link email
//  Send email with link to posting and start + end dates
//  Posting preview
//  Stepper

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMPTY_LOCATION: 'Location cannot be empty unless remote',
    SALARY_ORDER: 'Salary max cannot be less than salary min',
    SALARY_NEGATIVE: 'Salary cannot be negative',
    WEBSITE_LINK: 'Invalid link format [https://www.example.com]',
    APPLICATION_LINK: 'Invalid link format [https://www.example.com or email@example.com]'
}

const initEditorValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    }
]

const initErrorState: { [key: string]: string | null } = {
    title: null,
    company: null,
    companyUrl: null,
    description: null,
    location: null,
    applicationLink: null,
    skills: null,
    salaryMin: null,
    salaryMax: null
}

const Post: NextPage = () => {
    const [jobDetails, setJobDetails] = useState<PostForm>({
        title: '',
        company: '',
        companyUrl: '',
        companyLogo: '',
        type: TYPE.FULLTIME,
        location: '',
        remote: false,
        // description: '',
        applicationLink: '',
        skills: [],
        perks: [],
        salaryMin: 0,
        salaryMax: 0,
        // TO DO: Hardcoded
        featured: false
    })

    const [imageFileName, setImageFileName] = useState('')
    const [imagePreviewSource, setImagePreviewSource] = useState<string | ArrayBuffer | null>('')
    const [logo, setLogo] = useState<FormData>()
    const [logoError, setLogoError] = useState(false)
    // const [logoFile, setLogoFile] = useState<string | Blob>('')

    const [locationText, setLocationText] = useState('')
    const [descriptionEditorValue, setDescriptionEditorValue] = useState(initEditorValue)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrorState)
    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const invalid = Object.keys(errors).some(field => errors[field])

    const validate = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrorState)
        const descriptionEmpty = descriptionEditorValue.length === 1 && !descriptionEditorValue[0].children[0]?.text.length

        if (!isValidHttpUrl(jobDetails.companyUrl.trim())) {
            newErrors['companyUrl'] = ERROR.WEBSITE_LINK
        }
        if (!isValidHttpUrl(jobDetails.applicationLink.trim()) && !isValidEmail(jobDetails.applicationLink.trim())) {
            newErrors['applicationLink'] = ERROR.APPLICATION_LINK
        }
        for (const field in jobDetails) {
            // @ts-ignore
            if ((typeof jobDetails[field] === 'string' && !jobDetails[field].trim()) && field !== 'companyLogo') {
                if (field !== 'companyLogo' && field !== 'location') {
                    newErrors[field] = ERROR.EMPTY
                    isValid = false
                }
            }
        }
        if (!jobDetails.location && !jobDetails.remote) {
            newErrors['location'] = ERROR.EMPTY_LOCATION
            isValid = false
        }
        if (jobDetails.salaryMin === 0) {
            newErrors['salaryMin'] = ERROR.EMPTY
            isValid = false
        }
        if (jobDetails.salaryMin < 0) {
            newErrors['salaryMin'] = ERROR.SALARY_NEGATIVE
            isValid = false
        }
        if (jobDetails.salaryMax === 0) {
            newErrors['salaryMax'] = ERROR.EMPTY
            isValid = false
        }
        if (jobDetails.salaryMax < 0) {
            newErrors['salaryMax'] = ERROR.SALARY_NEGATIVE
            isValid = false
        }
        if (jobDetails.salaryMax < jobDetails.salaryMin) {
            newErrors['salaryMax'] = ERROR.SALARY_ORDER
        }
        if (!jobDetails.skills.length) {
            newErrors['skills'] = ERROR.EMPTY
            isValid = false
        }
        if (descriptionEmpty) {
            newErrors['description'] = ERROR.EMPTY
            isValid = false
        }

        setErrors(newErrors)
        
        if (!isValid) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        return isValid
    }

    const isValidHttpUrl = (text: string) => {
        let url
        try {
            url = new URL(text)
        } catch (_) {
            return false
        }
        return url.protocol === "http:" || url.protocol === "https:"
    }

    const isValidEmail = (email: string) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true)
        } else {
            return (false)
        }
    }

    // TO DO: Validate urls - provide https if absent or add prefix before input
    const createJob = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        try {
            // const data = new FormData()
            // data.set('image', logoFile)

            // TO DO: Error handling
            const imageUploadRes = await axios.post('http://localhost:3000/api/jobs/upload-image', logo, { 
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            const res = await axios.post('http://localhost:3000/api/jobs', { 
                ...jobDetails,
                remote: jobDetails.remote || jobDetails.location === 'Remote',
                title: jobDetails.title.trim(),
                backfilled: false,
                company: jobDetails.company.trim(),
                companyUrl: jobDetails.companyUrl.trim(),
                companyLogo: imageUploadRes.data ?? '',
                description: serialize({ children: descriptionEditorValue }),
                applicationLink: isValidEmail(jobDetails.applicationLink.trim()) ? `mailto:${jobDetails.applicationLink.trim()}` : jobDetails.applicationLink.trim()
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

    const handleAutocompleteChange = (value: string) => {
        setJobDetails({ ...jobDetails, location: value, remote: value === 'Remote' })
    }

    const handleSkillsChange = (value: string[]) => {
        setJobDetails({ ...jobDetails, skills: value })
    }

    const handlePerksChange = (value: string[]) => {
        setJobDetails({ ...jobDetails, perks: value })
    }

    // TO DO
    // @ts-ignore
    const handleFileInputChange = (e: ChangeEventHandler<HTMLInputElement>) => {
        const file = e.target.files[0]
        const fileSize = Math.round(file.size / 1024)
        if (fileSize > 10000) {
            setLogoError(true)
            return
        }
        
        setLogoError(false)
        const formData = new FormData()
        formData.append('image', file)
        setLogo(formData)

        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onloadend = () => {
            setImagePreviewSource(fileReader.result)
            setImageFileName(file.name)
        }
    }

    const handleCheckboxChange = (value: boolean) => {
        setJobDetails({ ...jobDetails, remote: value })
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
        <Grid container justifyContent='center' pt={mobile ? 0 : 2} pb={mobile ? 2 : 4}>
            <Grid xs={12} sm={10} lg={9} p={2} pb={mobile ? 0 : 2}>
                <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: 'lightyellow', borderRadius: 1 }}>
                    <Typography mb={2} variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Post a job</Typography>
                    <Typography variant='h2' fontSize={16} color='grey'>Hire the best React developers for an affordable price.</Typography>
                </Box>
            </Grid>

            {mobile && (
                <Grid xs={12} p={2} pb={0}>
                    <PostingInfoBox mobile={mobile} />
                </Grid>
            )}

            <Grid xs={12} sm={10} lg={9} p={2} container>
                <Grid xs={12} sm={8} container>
                    <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            {invalid && (
                                <Grid xs={12}>
                                    <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                </Grid>
                            )}

                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Title</Typography>
                                    <FilledInput error={!!errors['title']} disableUnderline={!errors['title']} onChange={handleInputChange} name='title' value={jobDetails.title} autoComplete='off' inputProps={{ label: 'Job Title' }} required placeholder='Job Title' fullWidth />
                                    <FormHelperText error>{errors['title']}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Type</Typography>
                                    <Select error={true} onChange={(value) => handleSelectChange(value)} name='type' value={jobDetails.type} variant='filled' disableUnderline fullWidth>
                                        <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                                        <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                                        <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid xs={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Salary Min. <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                    <FilledInput error={!!errors['salaryMin']} disableUnderline={!errors['salaryMin']}  type='number' fullWidth onChange={handleInputChange} name='salaryMin' value={jobDetails.salaryMin} autoComplete='off' required placeholder='Min' sx={{ marginRight: '0.25rem' }}  inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                    <FormHelperText error>{errors['salaryMin']}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid xs={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Salary Max. <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                    <FilledInput error={!!errors['salaryMax']} disableUnderline={!errors['salaryMax']}  type='number' fullWidth onChange={handleInputChange} name='salaryMax' value={jobDetails.salaryMax} autoComplete='off' required placeholder='Max' inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                    <FormHelperText error>{errors['salaryMax']}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Name</Typography>
                                    <FilledInput error={!!errors['company']} disableUnderline={!errors['company']}  onChange={handleInputChange} name='company' value={jobDetails.company} autoComplete='off' placeholder='Company Name' fullWidth sx={{ verticalAlign: 'center' }} />
                                    <FormHelperText error>{errors['company']}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</Typography>
                                    <FilledInput error={!!errors['companyUrl']} disableUnderline={!errors['companyUrl']}  onChange={handleInputChange} name='companyUrl' value={jobDetails.companyUrl} autoComplete='off' placeholder='https://' fullWidth />
                                    <FormHelperText error>{errors['companyUrl']}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth sx={{ position: 'relative' }}>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Logo</Typography>
                                    <FilledInput disableUnderline value={imageFileName} disabled sx={{ paddingLeft: 15, backgroundColor: 'rgba(0, 0, 0, 0.06) !important'}} />
                                    <Button disableElevation variant="contained" component="label" style={{ position: 'absolute', marginTop: 38, left: '0.75rem' }}>
                                        Choose file
                                        <input onChange={handleFileInputChange} hidden accept="image/*" multiple type="file" />
                                    </Button>
                                    {imagePreviewSource && (
                                        <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', borderBottom: logoError ? '2px solid #ff1644' : 'none', padding: '0px 12px 17px', height: '100px' }}>
                                            <img src={imagePreviewSource as string} alt='Logo preview' style={{ height: '100%' }} />
                                        </Box>
                                    )}
                                    {logoError && <FormHelperText error>{'File too big, please select an image 10MB or less'}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Location</Typography>
                                {/* TO DO: Virtualize options */}
                                <Autocomplete
                                    disablePortal
                                    renderInput={(params) => <TextField error={!!errors['location']} variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: !errors['location'], placeholder: 'Location', style: { padding: '9px 12px 10px' }}} />}
                                    options={cities}
                                    filterOptions={createFilterOptions({
                                        limit: 10
                                    })}
                                    onChange={(e, value) => handleAutocompleteChange(value || '')}
                                    inputValue={locationText}
                                    onInputChange={(event, newValue) => setLocationText(newValue)}
                                />
                                <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{errors['location']}</FormHelperText>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Remote <span style={{ fontWeight: 'normal' }}>(2+ days per week)</span></Typography>
                                    <Checkbox disabled={jobDetails.location === 'Remote'} checked={jobDetails.remote} onChange={(e) => handleCheckboxChange(e.target.checked)} sx={{ width: '42px', alignSelf: 'center' }} />
                                </FormControl>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Description</Typography>
                                    {/* <FilledInput style={{marginBottom: '1rem'}} onChange={handleInputChange} name='description' value={jobDetails.description} placeholder='Job Description' disableUnderline fullWidth multiline rows={8} /> */}
                                    <TextEditor error={!!errors['description']} slateValue={descriptionEditorValue} setSlateValue={setDescriptionEditorValue} />
                                    <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{errors['description']}</FormHelperText>
                                </FormControl>
                            </Grid>

                            {/* <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills</Typography>
                                    <Select error={!!errors['skills']} disableUnderline={!errors['skills']} placeholder='CSS, HTML, JavaScript' multiple onChange={handleMultipleSelectChange} name='skills' value={jobDetails.skills} variant='filled' fullWidth renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip color='secondary.main' value={value} />
                                            ))}
                                        </Box>
                                    )}>
                                        {SKILLS.map(skill => <MenuItem key={skill} value={skill}>{skill}</MenuItem>)}
                                    </Select>
                                    <FormHelperText error>{errors['skills']}</FormHelperText>
                                </FormControl>
                            </Grid> */}

                            <Grid xs={12}>
                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills</Typography>
                                <Autocomplete
                                    freeSolo
                                    multiple
                                    disableClearable
                                    disablePortal
                                    renderInput={(params) => <TextField error={!!errors['skills']} variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: !errors['skills'], placeholder: jobDetails.skills.length ? '' : 'Select an option or add your own', style: { padding: '9px 12px 10px' }}} />}
                                    options={SKILLS}
                                    onChange={(e, value) => handleSkillsChange(value || '')}
                                />
                                <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{errors['skills']}</FormHelperText>
                            </Grid>

                            {/* <Grid xs={12}>
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
                                    <FormHelperText>Optional</FormHelperText>
                                </FormControl>
                            </Grid> */}

                            <Grid xs={12}>
                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Perks</Typography>
                                <Autocomplete
                                    freeSolo
                                    multiple
                                    disableClearable
                                    disablePortal
                                    renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: jobDetails.perks.length ? '' : 'Select an option or add your own', style: { padding: '9px 12px 10px' }}} />}
                                    options={PERKS}
                                    onChange={(e, value) => handlePerksChange(value || '')}
                                />
                                <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }}>Optional</FormHelperText>
                            </Grid>

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Application Link</Typography>
                                    <FilledInput error={!!errors['applicationLink']} disableUnderline={!errors['applicationLink']} required onChange={handleInputChange} name='applicationLink' value={jobDetails.applicationLink} autoComplete='off' placeholder='URL or Email address' fullWidth />
                                    <FormHelperText error>{errors['applicationLink']}</FormHelperText>
                                </FormControl>
                            </Grid>

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

                {!mobile && (
                    <Grid sm={4}>
                        <PostingInfoBox mobile={mobile} />
                    </Grid>
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

type PostingInfoBoxProps = {
    mobile: boolean
}
const PostingInfoBox = ({ mobile }: PostingInfoBoxProps) => {
    return (
        <Box ml={mobile ? 0 : 4} mb={mobile ? 0 : 4} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }} display='flex' flexDirection='column'>
            {/* <Typography>Your job will be seen by <strong>12,782</strong> professionals.</Typography> */}
            <Typography textAlign='center'>Your job will be live for <strong>30</strong> days.</Typography>
        </Box>
    )
}
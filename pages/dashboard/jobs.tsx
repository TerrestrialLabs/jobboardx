import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FilledInput, FormControl, FormHelperText, IconButton, Modal, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/Dashboard'
import axiosInstance from '../../api/axios'
import { JobData } from '../../models/Job'
import { useRouter } from 'next/router'
import { AccessTime, Close, Delete, Edit, LocationOn, Paid } from '@mui/icons-material'
import { formatSalaryRange, getTimeDifferenceString, isExpired } from '../../utils/utils'
import { AUTH_STATUS, TYPE_MAP } from '../../const/const'
import Link from 'next/link'
import useMediaQuery from '@mui/material/useMediaQuery'
import { format, parseISO } from 'date-fns'
import { useSession } from '../../context/SessionContext'

const Jobs: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { status } = useSession()

    const [data, setData] = useState<JobData[]>([])
    const [fetched, setFetched] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const [jobToDelete, setJobToDelete] = useState<JobData | null>(null)
    const [deleting, setDeleting] = useState(false)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const fetchData = async () => {
        const res = await axiosInstance.get(`${baseUrlApi}jobs/employer-jobs`)
        setData(res.data)
        setFetched(true)
    }

    useEffect(() => {
        if (status === AUTH_STATUS.AUTHENTICATED) {
            fetchData()
        }
    }, [status])

    const deleteJob = async () => {
        setDeleting(true)
        try {
            if (jobToDelete) {
                await axiosInstance.delete(`${baseUrlApi}jobs/${jobToDelete._id}`)
                await fetchData()
                setJobToDelete(null)
            }
        } catch (err) {
            alert('Failed to delete job')
        }
        setDeleting(false)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Jobs`}</title>
                <meta name="description" content="Dashboard: Jobs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={2} pt={mobile ? 0 : 2}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={mobile ? 1 : 2} pb={2}>
                        <Grid xs={12}>
                            {fetched && data.length > 0 && (
                                <Grid xs={12} p={0}>
                                    <Box>
                                        <Typography fontWeight='bold'>{data.length} job{data.length > 1 ? 's' : ''}</Typography>
                                    </Box>
                                </Grid>
                            )}

                            {fetched && !data.length && (
                                <Box>
                                    <Typography textAlign='center'>No jobs posted</Typography>
                                </Box>
                            )}

                            {fetched && data.length > 0 && (
                                <Box mt={2}>
                                    {data.map((job, index) => (
                                        <JobItem
                                            key={job._id} 
                                            first={index === 0} 
                                            last={index === data.length - 1}
                                            isFocused={focusedIndex === index}
                                            setFocused={() => setFocusedIndex(index)}
                                            clearFocus={() => setFocusedIndex(null)}
                                            deleteJob={() => setJobToDelete(job)}
                                            {...job}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Grid>
            )} />

            {jobToDelete && <DeleteModal id={jobToDelete._id} confirmDelete={deleteJob} datePosted={jobToDelete.datePosted} deleting={deleting} title={jobToDelete.title} close={() => setJobToDelete(null)} />}
        </div>
    )
}

export default Jobs

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}

type JobItemProps = JobData & {
    first: boolean
    last: boolean
    isFocused: boolean
    setFocused: () => void
    clearFocus: () => void
    deleteJob: () => void
}
export const JobItem = ({
    _id,
    first,
    last,
    datePosted = new Date(),
    title,
    type,
    location,
    remote,
    featured,
    salaryMin,
    salaryMax,
    isFocused,
    setFocused,
    clearFocus,
    deleteJob
}: JobItemProps) => {
    const router = useRouter()
  
    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const expired = isExpired(datePosted)

    return (
        <Box p={2} onMouseEnter={setFocused} onMouseLeave={clearFocus} sx={{ 
            backgroundColor: featured ? 'lightyellow' : '#FAF9F6',
            border: '1px solid #e8e8e8',
            borderTopLeftRadius: first ? 4 : 0,
            borderTopRightRadius: first ? 4 : 0,
            borderBottomLeftRadius: last ? 4 : 0,
            borderBottomRightRadius: last ? 4 : 0
        }}>
            <Grid container alignItems='center'>
                <Grid xs={9} sm={5}>
                    <Box mr={2}>
                        <Box display='flex'>
                            <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{featured ? 'Featured' : 'Regular'}</Typography>
                            {!expired && <Typography ml={1} color='grey' variant='subtitle1' sx={{ fontSize: '13.5px' }}>{getTimeDifferenceString(datePosted, true)}</Typography>}
                            {expired && <Typography ml={1} color='error' variant='subtitle1' sx={{ fontSize: '13.5px' }}>Expired</Typography>}
                        </Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: '600' }}><Link href={`/jobs/${_id}`}>{title}</Link></Typography>
                    </Box>
                </Grid>

                {mobile && (
                    <Grid xs={3} container justifyContent='flex-end'>
                        <Box display='flex' alignItems='center' justifyContent='flex-end' color='grey'>
                            <Link href={`/jobs/${_id}/edit`}><Edit sx={{ marginRight: 1, cursor: 'pointer' }} /></Link>
                            <Delete onClick={deleteJob} sx={{ cursor: 'pointer' }} />
                        </Box>
                    </Grid>
                )}

                <Grid xs={12} sm={6}>
                    <Box mr={2} display='flex' flexWrap='wrap' color='grey' alignItems='center'>
                        <Box mb={0.25} display='flex' alignItems='center'>
                            <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>
                        </Box>
        
                        <Box mb={0.25} display='flex' alignItems='center'>
                            <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>
                        </Box>
        
                        <Box display='flex' alignItems='center'>
                            <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                            <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
                        </Box>
                    </Box>
                </Grid>

                {!mobile && isFocused && (
                    <Grid xs={1} container>
                        <Box display='flex' alignItems='center'>
                            <Link href={`/jobs/${_id}/edit`}><Edit sx={{ marginRight: 1, cursor: 'pointer' }} /></Link>
                            <Delete onClick={deleteJob} sx={{ cursor: 'pointer' }} />
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    )
}

type DeleteModalProps = {
    id: string
    datePosted: Date
    title: string
    close: () => void
    confirmDelete: () => void
    deleting: boolean
}
export const DeleteModal = ({
    id,
    datePosted,
    title,
    close,
    confirmDelete,
    deleting
}: DeleteModalProps) => {
    const router = useRouter()
  
    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
    const dialogActions = mobile ? (
        <DialogActions sx={{ padding: 3, display: 'flex', flexDirection: 'column' }}>
            <Button sx={{ marginBottom: 2 }} fullWidth disabled={deleting} disableElevation variant='contained' color='error' onClick={confirmDelete}>
                {deleting ? <CircularProgress color='secondary' size={22} /> : 'Delete'}
            </Button>
            <Button fullWidth disabled={deleting} onClick={close}>
                Cancel
            </Button>
        </DialogActions>
    ) : (
        <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
            <Button disabled={deleting} onClick={close}>
                Cancel
            </Button>
            <Button disabled={deleting} disableElevation variant='contained' color='error' onClick={confirmDelete}>
                {deleting ? <CircularProgress color='secondary' size={22} /> : 'Delete'}
            </Button>
        </DialogActions>
    )

    return (
        <Dialog
            fullScreen={fullScreen}
            open
            onClose={close}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle>
                <Typography fontSize='20px'>Delete job</Typography>
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

            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this job?
                    This action is permanent and cannot be undone.
                </DialogContentText>

                <Box p={mobile ? 2 : 4} mt={2} sx={{ borderRadius: 1, border: '1px solid #e7e7e7' }}>
                    <Grid container>
                        <Grid xs={3}>
                            <Box mb={0.5}><Typography>Title:</Typography></Box>
                            <Box mb={0.5}><Typography>Posted:</Typography></Box>
                            <Box><Typography>Job ID:</Typography></Box>
                        </Grid>
                        <Grid xs={9}>
                            <Box mb={0.5}><Typography fontWeight='bold'>{title}</Typography></Box>
                            <Box mb={0.5}>
                                <Typography fontWeight='bold'>
                                    {format(parseISO(datePosted.toString()), 'MMM. d, yyyy')}
                                </Typography>
                            </Box>
                            <Box sx={{ overflow: 'hidden' }}><Typography fontWeight='bold'>{id}</Typography></Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            {dialogActions}
        </Dialog>
    )
}
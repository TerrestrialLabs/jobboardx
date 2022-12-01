import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'

const Header = () => {
    const router = useRouter()

    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const postPage = router.pathname === '/post'
    const editJobPage = router.pathname === '/jobs/edit/[token]'
    const postFormPage = postPage || editJobPage

    const unsubscribePage = router.pathname === '/unsubscribe/[id]'

    if (unsubscribePage) {
        return null
    }

    return (
        <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
            <Grid container justifyContent='center'>
                <Grid xs={11} sm={9}>
                    <Box display='flex' justifyContent='space-between' alignContent='center'>
                        <Link href='/'><Typography  color='#fff' variant='h1' fontSize={28} lineHeight={'42px'} fontWeight='bold' sx={{ cursor: 'pointer', textDecoration: 'none' }}>{jobboard.title}</Typography></Link>
                        <Button sx={{ flexShrink: 0 }} href={postFormPage ? '/' : '/post'} variant='contained' color='secondary' disableElevation>{postFormPage ? 'All jobs' : 'Post a job'}</Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Header
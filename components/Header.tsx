import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useWindowSize } from '../hooks/hooks'
import { useSession } from 'next-auth/react'

const Header = () => {
    const router = useRouter()

    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { data: session } = useSession()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const accountMenuOpen = Boolean(anchorEl)
    const handleAccountButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleAccountMenuClose = () => {
        setAnchorEl(null)
    }

    const windowSize = useWindowSize()
    const mobile = !windowSize.width || windowSize.width < 500

    const postPage = router.pathname === '/post'
    const editJobPage = router.pathname === '/jobs/edit/[token]'
    const postFormPage = postPage || editJobPage

    const unsubscribePage = router.pathname === '/unsubscribe/[id]'

    let buttonLink = '/post'
    if (!session?.user) {
        buttonLink = '/login'
    }
    if (postFormPage) {
        buttonLink = '/'
    }

    if (unsubscribePage) {
        return null
    }

    const menu = (
        <Menu
            id='account-menu'
            anchorEl={anchorEl}
            open={accountMenuOpen}
            onClose={handleAccountMenuClose}
            MenuListProps={{
                'aria-labelledby': 'account-button',
            }}
            sx={{ fontSize: '14px', marginTop: '0.5rem' }}
        >
            <Box p='6px 16px' mb='0.5rem' sx={{ width: '170px', borderBottom: '1px solid #e7e7e7' }}><Typography fontWeight='bold'>Employers</Typography></Box>
            {session && <MenuItem onClick={handleAccountMenuClose}><Link href='/dashboard'>Dashboard</Link></MenuItem>}
            {session && <MenuItem onClick={handleAccountMenuClose}><Link href='/logout'>Logout</Link></MenuItem>}

            {(!session || !session.user) && <MenuItem onClick={handleAccountMenuClose}><Link href='/login'>Log in</Link></MenuItem>}
            {(!session || !session.user) && <MenuItem onClick={handleAccountMenuClose}><Link href='/signup'>Sign up</Link></MenuItem>}
        </Menu>
    )

    return (
        <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
            <Grid container justifyContent='center'>
                <Grid xs={11} sm={9} display='flex' justifyContent='space-between' alignContent='center'>
                    
                        <Grid xs={5} sm={8}>
                            <Link href='/'>
                                <Typography noWrap textOverflow='ellipsis' color='#fff' variant='h1' fontSize={mobile ? 20 : 28} lineHeight={'42px'} fontWeight='bold' sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                                    {jobboard.title}
                                </Typography>
                            </Link>
                        </Grid>

                        {/* {!mobile && (
                            <Box>
                                <Button sx={{ color: '#fff', marginRight: 2 }} variant='text'>Jobs</Button>
                                <Button sx={{ color: '#fff' }} variant='text'>Blog</Button>
                            </Box>
                        )} */}

                        <Box>
                            <IconButton 
                                id='account-button' 
                                aria-controls={accountMenuOpen ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={accountMenuOpen ? 'true' : undefined}
                                onClick={handleAccountButtonClick}
                                sx={{ backgroundColor: '#fff', padding: 0, marginRight: 2, "&:hover": { backgroundColor: "#fff" } }}
                            >
                                <AccountCircleIcon fontSize='large' color='secondary' />
                            </IconButton>

                            {menu}

                            <Button sx={{ flexShrink: 0 }} href={buttonLink} variant='contained' color='secondary' disableElevation>{postFormPage ? 'All jobs' : 'Post a job'}</Button>
                        </Box>
                    
                </Grid>
            </Grid>
        </Box>
    )
}

export default Header
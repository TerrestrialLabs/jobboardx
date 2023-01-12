import { Box, Button, Drawer, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { AccountCircle, Close, GridView, Key, Logout, Menu as MenuIcon, PersonAddAlt, Work } from '@mui/icons-material'
import { useWindowSize } from '../hooks/hooks'
import { ROLE } from '../const/const'
import { useSession } from '../context/SessionContext'

const Header = () => {
    const router = useRouter()

    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const session = useSession()

    const [drawerOpen, setDrawerOpen] = useState(false)

    const boardTitle = jobboard ? jobboard.title : 'JobBoardX'

    // @ts-ignore
    const isEmployer = session?.user && session?.user?.role === ROLE.EMPLOYER
    // @ts-ignore
    const isAdmin = session?.user && (session?.user?.role === ROLE.ADMIN || session?.user?.role === ROLE.SUPERADMIN)

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
    const verifyPage = router.pathname === '/verify'

    let buttonLink = '/post'
    if (!session?.user) {
        buttonLink = '/login'
    }
    if (postFormPage) {
        buttonLink = '/'
    }

    if (unsubscribePage || verifyPage) {
        return null
    }

    const toggleDrawer = (event: { type: string; key: string }, value: boolean) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return
          }
        setDrawerOpen(value)
    }

    // @ts-ignore
    const closeDrawer = (e) => toggleDrawer(e, false)

    const menu = (
        <Menu
            id='account-menu'
            anchorEl={anchorEl}
            open={accountMenuOpen}
            onClose={handleAccountMenuClose}
            MenuListProps={{
                'aria-labelledby': 'account-button',
                sx: { width: '170px' }
            }}
            sx={{ fontSize: '14px', marginTop: '0.5rem' }}
        >
            {!session?.user && <Box p='6px 16px' mb='0.5rem' sx={{ borderBottom: '1px solid #e7e7e7' }}><Typography fontWeight='bold'>{isAdmin ? 'Admin' : 'Employers'}</Typography></Box>}

            {session?.user && isEmployer && (
                <MenuItem onClick={handleAccountMenuClose}>
                    <Link href='/dashboard'>
                        <Box display='flex'>
                            <GridView fontSize='small' />
                            <Typography fontSize='14px' ml={1}>Dashboard</Typography>
                        </Box>
                    </Link>
                </MenuItem>
            )}

            {session?.user && isEmployer && mobile && (
                <MenuItem onClick={handleAccountMenuClose}>
                    <Link href='/post'>
                        <Box display='flex'>
                            <Work fontSize='small' />
                            <Typography fontSize='14px' ml={1}>Post a job</Typography>
                        </Box>
                    </Link>
                </MenuItem>
            )}

            {session?.user && (
                <MenuItem onClick={handleAccountMenuClose}>
                    <Link href='/logout'>
                        <Box display='flex'>
                            <Logout fontSize='small' />
                            <Typography fontSize='14px' ml={1}>Logout</Typography>
                        </Box>
                    </Link>
                </MenuItem>
            )}

            {(!session || !session.user) && (
                <MenuItem onClick={handleAccountMenuClose}>
                    <Link href='/login'>
                        <Box display='flex'>
                            <Key fontSize='small' />
                            <Typography fontSize='14px' ml={1}>Log in</Typography>
                        </Box>
                    </Link>
                </MenuItem>
            )}

            {(!session || !session.user) && (<MenuItem onClick={handleAccountMenuClose}>
                <Link href='/signup'>
                    <Box display='flex'>
                        <PersonAddAlt fontSize='small' />
                        <Typography fontSize='14px' ml={1}>Sign up</Typography>
                    </Box>
                </Link>
            </MenuItem>)}
        </Menu>
    )

    return (
        <Box py={1} bgcolor='primary.main' color='white' sx={{ height: '58px', position: 'fixed', width: '100%', zIndex: 999 }}>
            <Grid container justifyContent='center'>
                <Grid xs={11} sm={10} lg={9} display='flex' justifyContent='space-between' alignContent='center'>
                    
                        <Box>
                            <Link href='/'>
                                <Typography noWrap textOverflow='ellipsis' color='#fff' variant='h1' fontSize={mobile ? 20 : 28} lineHeight={'42px'} fontWeight='bold' sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                                    {boardTitle}
                                </Typography>
                            </Link>
                        </Box>

                        <Box display='flex' flexDirection='row' alignItems='center'>
                            {jobboard && !mobile && (
                                <Box mr={3} display='flex' flexDirection='row' alignItems='center'>
                                    <Button href='/' sx={{ color: '#fff', marginRight: 1 }} variant='text'>Jobs</Button>
                                    <Button href='/companies' sx={{ color: '#fff' }} variant='text'>Companies</Button>
                                </Box>
                            )}

                            <IconButton 
                                id='account-button' 
                                aria-controls={accountMenuOpen ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={accountMenuOpen ? 'true' : undefined}
                                onClick={handleAccountButtonClick}
                                sx={{ backgroundColor: '#fff', padding: 0, "&:hover": { backgroundColor: "#fff" } }}
                            >
                                <AccountCircle fontSize='large' color='secondary' />
                            </IconButton>

                            {menu}

                            {jobboard && !mobile && <Button sx={{ flexShrink: 0, marginLeft: 2 }} href={buttonLink} variant='contained' color='secondary' disableElevation>{postFormPage ? 'All jobs' : 'Post a job'}</Button>}

                            {mobile && (
                                <Box ml={3}>
                                    <IconButton 
                                        sx={{ padding: 0 }}
                                        edge="start"
                                        color="inherit"
                                        aria-label="open drawer"
                                        // @ts-ignore
                                        onClick={(e) => toggleDrawer(e, true)}
                                    >   
                                        <MenuIcon fontSize='large' />
                                    </IconButton>
                                </Box>
                            )}

                            {mobile && (
                                <Drawer
                                    anchor='right'
                                    variant='temporary'
                                    open={drawerOpen}
                                    // @ts-ignore
                                    onClose={closeDrawer}
                                    >
                                        <Box pl={8} pr={8} sx={{ height: '100%', backgroundColor: '#000' }}>
                                            <Box pt={4} display='flex' justifyContent='center'>
                                                <IconButton onClick={closeDrawer}>
                                                    <Close color='primary' />
                                                </IconButton>
                                            </Box>

                                            <Box pt={3} display='flex' flexDirection='column'>
                                                <Typography textAlign='center' mb={1} color='#fff' fontWeight='bold'>{boardTitle}</Typography>
                                                {jobboard && <Button sx={{ color: '#fff' }} href='/' variant='text'>Jobs</Button>}
                                                {jobboard && <Button sx={{ color: '#fff' }} href='/companies' variant='text'>Companies</Button>}
                                                <Button sx={{ color: '#fff' }} href='/terms' variant='text'>Terms of Service</Button>
                                                <Button sx={{ color: '#fff' }} href='/privacy' variant='text'>Privacy Policy</Button>
                                                <Button sx={{ color: '#fff' }} href='/contact' variant='text'>Contact</Button>
                                            </Box>
                                        </Box>
                                    </Drawer>
                            )}
                        </Box>
                    
                </Grid>
            </Grid>
        </Box>
    )
}

export default Header
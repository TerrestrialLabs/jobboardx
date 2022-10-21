import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { colors } from '@mui/material'

const theme = createTheme({
    typography: {
        fontFamily: 'Poppins, sans-serif'
    },
    palette: {
        primary: {
            main: '#18e',
        },
        secondary: {
            main: '#0b0b15',
        },
        error: {
            main: red.A400,
        }
    }
})

export default theme
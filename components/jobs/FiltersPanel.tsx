import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, MenuItem, Select, SelectChangeEvent, Typography, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { Close } from '@mui/icons-material'
import { Dispatch, SetStateAction } from 'react'
import { TYPE, TYPE_MAP } from '../../const/const'

type Filters = {
  search: string,
  type: string
  location: string,
  salaryMin: number
}

type FiltersPanelProps = {
  open: boolean
  filters: Filters
  handleFilterInputChange: (e: { target: { name: any; value: any } }) => void
  handleFilterSelectChange: (e: SelectChangeEvent<string | number>) => void
  setFiltersOpen: Dispatch<SetStateAction<boolean>>
  search: () => void
}
export const FiltersPanel = ({ open, filters, handleFilterInputChange, handleFilterSelectChange, setFiltersOpen, search }: FiltersPanelProps) => {
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
export const SalaryField = ({ mobile, onChange, value }: SalaryFieldProps) => {
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
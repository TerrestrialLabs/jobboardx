import { differenceInDays, parseISO } from 'date-fns'

export const formatSalaryRange = (min: number, max: number) => {
    const minThousands = min > 0 ? Math.floor(min / 1000) : 0
    const maxThousands = max > 0 ? Math.floor(max / 1000) : 0
    return minThousands === maxThousands ? `$${minThousands}k` : `$${minThousands}k - $${maxThousands}k`
}

export const getTimeDifferenceString = (date: Date, abbreviate?: boolean) => {
    const difference = differenceInDays(Date.now(), parseISO(date.toString()))
    if (abbreviate) {
        return difference === 0 ? 'Today' : `${difference}d`
    }
    return difference === 0 ? 'New' : `${difference} day${difference === 1 ? '' : 's'} ago`
}

export const isExpired = (datePosted: Date) => {
    const days = 31
    const currentDate = new Date()
    const thirtyDaysAgoDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000))
    return (new Date(datePosted)) < thirtyDaysAgoDate
}

export const isValidEmail = (email: string) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
        return (true)
    } else {
        return (false)
    }
  }
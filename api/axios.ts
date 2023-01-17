import axios from 'axios'
import { getUserForSession } from './getSession'

const axiosInstance = axios.create({
    baseURL: axios.defaults.baseURL,
    headers: axios.defaults.headers
})

axiosInstance.interceptors.response.use(
    async (res) => {
        // When updating user we need to generate new access & refresh tokens
        if (res.config.url?.endsWith('/api/auth/update')) {
            const updatedUser = getUserForSession(res.data)
            
            const { data } = await axios.post(`${axios.defaults.baseURL}/api/auth/reset-tokens`, updatedUser)

            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        }

        return res
    },
    async (error) => {
        const prevRequest = error.config
        if (error.response) {
            if (error.response.status === 401 && !prevRequest._retry) {
                prevRequest._retry = true;
                
                try {
                    const { data } = await axios.post(`${axios.defaults.baseURL}/api/auth/refresh`, {})

                    const newAccessToken = data.accessToken

                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`

                    return axiosInstance({
                        ...prevRequest,
                        headers: {
                            ...prevRequest.headers,
                            Authorization: `Bearer ${newAccessToken}`,
                            sent: true
                        }
                    })
                } catch (err) {
                    // @ts-ignore
                    if (err.response.status === 401) {
                        await axios.post(`${axios.defaults.baseURL}/api/auth/logout`)
                    }
                }
            }
        }
      return Promise.reject(error);
    }
)

export default axiosInstance
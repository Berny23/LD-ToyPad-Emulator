import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import characters from '@/api/characters'
import toytags from '@/api/toytags'
import vehicles from '@/api/vehicles'

// eslint-disable-next-line unicorn/no-anonymous-default-export
export default () => {
  const axiosInstance = axios.create({})

  // Global error logging interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      console.error('API Error:', error)
      return Promise.reject(error)
    }
  )

  const characterEndpoint = characters(axiosInstance)
  const vehicleEndpoint = vehicles(axiosInstance)
  const toyTagEndpoint = toytags(axiosInstance)
  return {
    characterEndpoint,
    vehicleEndpoint,
    toyTagEndpoint
  }
}

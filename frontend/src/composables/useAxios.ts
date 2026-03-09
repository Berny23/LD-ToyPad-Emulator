import axios from 'axios'
import characters from '@/api/characters'
import vehicles from '@/api/vehicles'
import toytags from '@/api/toytags'

export default () => {
  const axiosInstance = axios.create({})

  const characterEndpoint = characters(axiosInstance)
  const vehicleEndpoint = vehicles(axiosInstance)
  const toyTagEndpoint = toytags(axiosInstance)
  return {
    characterEndpoint,
    vehicleEndpoint,
    toyTagEndpoint
  }
}

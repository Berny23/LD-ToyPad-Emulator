import type { AxiosInstance } from 'axios'
import type { Vehicle } from '@/types/vehicles'

export default (api: AxiosInstance) => {
  const getAllVehicles = async (): Promise<Vehicle[]> => {
    const response = await api.get('/json/tokenmap.json')
    if (response.status === 200) {
      return response.data
    }
    return []
  }

  const createVehicle = async (id: number): Promise<boolean> => {
    const response = await api.post('/vehicle', {
      id
    })
    return response.status === 200
  }

  const createVehicles = async (vehicles: Vehicle[]): Promise<number> => {
    if (!vehicles) {
      return 0
    }

    let success = 0
    for (let i = 0; i < vehicles!.length; i++) {
      const created = await createVehicle(vehicles[i]!.id)
      if (created) {
        success++
      }
    }
    return success
  }

  return {
    getAllVehicles,
    createVehicle,
    createVehicles
  }
}

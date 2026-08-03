import type { AxiosInstance } from 'axios'

import type { ToyTag } from '@/types/tag'

export default (api: AxiosInstance) => {
  const getToyTags = async (): Promise<ToyTag[]> => {
    const response = await api.get('/json/toytags.json')
    if (response.status === 200) {
      return response.data
    }
    return []
  }

  const placeToyTag = async (
    toPlace: ToyTag,
    index: number,
    position: number
  ): Promise<boolean> => {
    const response = await api.post('/place', {
      id: toPlace.id,
      index,
      position,
      uid: toPlace.uid
    })

    return response.status === 200
  }

  const removeToyTag = async (uid: string, index: number): Promise<boolean> => {
    const response = await api.delete('/remove', {
      data: {
        uid,
        index
      }
    })
    if (response.status === 200) {
      return response.data
    }
    return false
  }

  return {
    getToyTags,
    placeToyTag,
    removeToyTag
  }
}

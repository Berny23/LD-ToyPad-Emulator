import type { Character } from '@/types/character'
import type { AxiosInstance } from 'axios'

export default (api: AxiosInstance) => {
  const getAllCharacters = async (): Promise<Character[]> => {
    const response = await api.get('/json/charactermap.json')
    if (response.status === 200) {
      return response.data
    }
    return []
  }

  const createCharacter = async (id: number): Promise<boolean> => {
    const response = await api.post('/character', {
      id
    })
    return response.status === 200
  }

  const createCharacters = async (characters: Character[]): Promise<number> => {
    if (!characters) {
      return 0
    }

    let success = 0
    for (let i = 0; i < characters!.length; i++) {
      console.log('creating', characters[i])
      const created = await createCharacter(characters[i]!.id)

      if (!created) {
        console.error(
          `Failed to create character with ID: ${characters[i]!.id}`
        )
        return -1
      }

      success++
    }
    return success
  }

  return {
    getAllCharacters,
    createCharacter,
    createCharacters
  }
}

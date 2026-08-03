import { useLocalStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useLocalStorage<string>('theme', 'light')
  const language = useLocalStorage<'en'>('language', 'en')

  return {
    theme,
    language
  }
})

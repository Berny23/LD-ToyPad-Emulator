<template>
  <v-app>
    <suspense>
      <router-view />
    </suspense>
  </v-app>
</template>

<script lang="ts" setup>
  import { useTheme } from 'vuetify'
  import i18n from '@/plugins/i18n'
  import { useSettingsStore } from './stores/settings'
  const theme = useTheme()

  const settingsStore = useSettingsStore()
  const { theme: selectedTheme, language } = storeToRefs(settingsStore)

  theme.change(selectedTheme.value)
  i18n.global.locale = language.value
</script>

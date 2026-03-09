<template>
  <v-footer app>
    <v-icon-btn
      class="me-2"
      :icon="themeIcon"
      @click="toggleTheme"
    />
    <v-select
      v-model="language"
      density="compact"
      hide-details
      :items="locales"
      max-width="150px"
      variant="solo-filled"
    >
      <template #selection="{ item }">
        <span>{{ t(`settings.languages.${item.raw}`) }}</span>
      </template>
      <template #item="{ item, props }">
        <v-list-item
          v-bind="props"
          :title="t(`settings.languages.${item.raw}`)"
        />
      </template>
    </v-select>

    <!--TODO DISPLAY VERSION OF THE CONTAINER/BACKEND HERE-->

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px"
    >
      &copy; {{ new Date().getFullYear() }}
      <span class="d-none d-sm-inline-block">
        Berny23, Cort1237 and many others —
      </span>

      <a
        class="text-decoration-none on-surface d-none d-sm-inline-block"
        href="https://choosealicense.com/licenses/mit"
        rel="noopener noreferrer"
        target="_blank"
      >
        MIT License
      </a>
      <a
        class="d-inline-block mx-2 social-link"
        href="https://github.com/Berny23/LD-ToyPad-Emulator"
        rel="noopener noreferrer"
        target="_blank"
        title="Github"
      >
        <v-icon
          icon="mdi-github"
          size="24"
        />
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useTheme } from 'vuetify'
  import { locales } from '@/plugins/i18n'
  import { useSettingsStore } from '@/stores/settings'
  const theme = useTheme()

  const settingsStore = useSettingsStore()
  const { t } = useI18n()
  const { theme: selectedTheme, language } = storeToRefs(settingsStore)

  const themes = ref(['dark', 'system', 'light'])

  const themeIcon = computed(() => {
    switch (selectedTheme.value) {
      case 'dark': {
        return 'mdi-weather-night'
      }
      case 'light': {
        return 'mdi-white-balance-sunny'
      }
      case 'system': {
        return 'mdi-theme-light-dark'
      }
    }
    return 'mdi-brightness-1'
  })

  const toggleTheme = () => {
    const index =
      (themes.value.indexOf(selectedTheme.value) + 1) % themes.value.length
    theme.change(themes.value[index]!)
    selectedTheme.value = themes.value[index]!
    console.log(selectedTheme.value)
  }
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>

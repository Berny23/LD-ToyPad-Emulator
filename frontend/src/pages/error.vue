<template>
  <v-container class="fill-height">
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        md="6"
        sm="8"
      >
        <v-card class="text-center pa-8">
          <v-card-title class="text-h4 mb-4">
            <v-icon
              class="mb-2"
              color="error"
              icon="mdi-alert-circle"
              size="48"
            />

            <div>{{ t('error.title') }}</div>
          </v-card-title>

          <v-card-text class="text-base mb-6">
            <p>{{ t('error.description') }}</p>
            <p
              v-if="errorMessage"
              class="text-caption text-grey mt-4"
            >
              {{ errorMessage }}
            </p>
          </v-card-text>

          <v-card-actions class="justify-center gap-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-reload"
              variant="tonal"
              @click="reload"
            >
              {{ t('error.reload_button') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const errorMessage = computed(() => {
    return route.query.message as string | undefined
  })

  const reload = () => {
    router.push('/')
  }
</script>

<style scoped></style>

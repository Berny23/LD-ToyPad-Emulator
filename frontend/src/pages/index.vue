<template>
  <template v-if="!loading">
    <create-toy-dialog v-model:active="createDialog" />
    <v-container>
      <v-row>
        <v-col
          class="text-center text-high-emphasis text-h6"
          cols="12"
        >
          {{ t('title') }}
        </v-col>
      </v-row>
      <v-row
        dense
        justify="center"
      >
        <v-col
          cols="12"
          lg="10"
        >
          <toy-box
            v-model:create-dialog="createDialog"
            v-model:toy-tags="unusedToyTags"
          />
        </v-col>
        <v-col
          class="overflow-auto"
          cols="12"
          lg="10"
        >
          <toy-pad />
        </v-col>
        <v-col
          cols="12"
          lg="10"
        >
          <v-container>
            <v-row justify="space-between">
              <v-col
                class="d-flex justify-start align-center"
                cols="12"
                lg="8"
              >
                <span class="font-weight-bold text-high-emphasis">
                  {{ t('sync_info.title') }}
                </span>
              </v-col>
              <v-col
                class="d-flex justify-end align-center"
                cols="12"
                lg="4"
              >
                <v-btn
                  prepend-icon="mdi-sync"
                  :text="t('sync_info.btn')"
                  @click="syncPad"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </template>
  <template v-else>
    <v-container class="fill-height">
      <v-row
        align="center"
        class="fill-height"
        justify="center"
      >
        <v-col
          class="text-center"
          cols="12"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          />
        </v-col>
      </v-row>
    </v-container>
  </template>
</template>
<script lang="ts" setup>
  import type { ToyTag } from '@/types/tag'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  import useAxios from '@/composables/useAxios'
  import useSocket from '@/composables/useSocket'
  import { useAppStore } from '@/stores/app'

  const { characterEndpoint, vehicleEndpoint, toyTagEndpoint } = useAxios()
  const { t } = useI18n()
  const router = useRouter()
  const { syncPad } = useSocket()
  const appStore = useAppStore()

  const { toyTags, characters, vehicles } = storeToRefs(appStore)
  const createDialog = ref<boolean>(false)
  const loading = ref<boolean>(true)

  const unusedToyTags = computed(() =>
    // TODO FIX THIS IN THE BACKEND index gets parsed as a string here
    toyTags.value.filter((x: ToyTag) => x.index == -1)
  )

  onMounted(async () => {
    try {
      loading.value = true
      toyTags.value = await toyTagEndpoint.getToyTags()
      characters.value = await characterEndpoint.getAllCharacters()
      vehicles.value = await vehicleEndpoint.getAllVehicles()
      loading.value = false
    } catch (error) {
      console.error('Failed to load initial data:', error)
      const message =
        error instanceof Error ? error.message : t('error.backend_error')
      router.push({
        path: '/error',
        query: { message: message }
      })
    }
  })
</script>
<style lang="scss" scoped></style>

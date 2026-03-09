<template>
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
<script lang="ts" setup>
  import type { ToyTag } from '@/types/tag'
  import { useI18n } from 'vue-i18n'

  import useAxios from '@/composables/useAxios'
  import useSocket from '@/composables/useSocket'
  import { useAppStore } from '@/stores/app'

  const { characterEndpoint, vehicleEndpoint, toyTagEndpoint } = useAxios()
  const { t } = useI18n()
  const { syncPad } = useSocket()
  const appStore = useAppStore()

  const { toyTags, characters, vehicles } = storeToRefs(appStore)
  const createDialog = ref<boolean>(false)

  const unusedToyTags = computed(() =>
    // TODO FIX THIS IN THE BACKEND index gets parsed as a string here
    toyTags.value.filter((x: ToyTag) => x.index == -1)
  )

  toyTags.value = await toyTagEndpoint.getToyTags()
  characters.value = await characterEndpoint.getAllCharacters()
  vehicles.value = await vehicleEndpoint.getAllVehicles()
</script>
<style lang="scss" scoped></style>

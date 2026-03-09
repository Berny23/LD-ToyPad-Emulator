<template>
  <v-snackbar
    v-model="snackbar"
    color="info"
    rounded="pill"
  >
    <span class="d-flex justify-center align-center text-center">
      {{
        t('create_toy_dialog.created', {
          characters: numCharactersCreated,
          vehicles: numVehiclesCreated
        })
      }}
    </span>
  </v-snackbar>
  <v-dialog
    v-model="active"
    :max-height="height"
    :max-width="width"
    persistent
  >
    <v-card
      :disabled="creating"
      :loading="creating"
      :title="t('create_toy_dialog.title')"
    >
      <template #append>
        <v-icon-btn
          icon="mdi-close"
          @click="active = false"
        />
      </template>
      <v-card-text class="fill-height">
        <v-autocomplete
          v-model="selectedCharacters"
          clear-on-select
          clearable
          color="primary"
          :disabled="characterToSelect.length === 0"
          item-title="name"
          item-value="id"
          :items="characterToSelect"
          :label="t('create_toy_dialog.create_character')"
          multiple
          return-object
          variant="outlined"
        >
          <template #prepend-item>
            <v-list-item
              :title="t('create_toy_dialog.select_all')"
              @click="toggleCharacters"
            >
              <template #prepend>
                <v-checkbox-btn
                  :color="someCharactersSelected ? 'primary' : undefined"
                  :indeterminate="
                    someCharactersSelected && !allCharactersSelected
                  "
                  :model-value="allCharactersSelected"
                />
              </template>
            </v-list-item>

            <v-divider class="mt-2" />
          </template>
          <template #selection="{ item, index }">
            <v-chip
              v-if="index < 3"
              color="primary"
              :text="item.title"
            />

            <span
              v-if="index === 3"
              class="text-grey text-caption align-self-center"
            >
              ({{
                t('create_toy_dialog.others', {
                  others: selectedCharacters.length - 3
                })
              }})
            </span>
          </template>
          <template #item="{ item, props }">
            <v-list-item
              v-bind="props"
              active-class="text-primary"
              :subtitle="
                t('create_toy_dialog.world', { world: item.raw.world })
              "
            >
              <template #prepend>
                <!-- TODO THIS WOULD BE NICER IF WE WOULD HAVE A DEDICATED FALLBACK IMAGE -->
                <v-avatar>
                  <v-img :src="`/images/${item.raw.id}.png`">
                    <template #error>
                      <v-icon
                        icon="mdi-account"
                        style="height: 100%"
                      />
                    </template>
                    <template #placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          color="primary"
                          indeterminate
                        />
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
        <v-autocomplete
          v-model="selectedVehicles"
          clear-on-select
          clearable
          color="primary"
          :disabled="vehiclesToSelect.length === 0"
          item-title="name"
          item-value="id"
          :items="vehiclesToSelect"
          :label="t('create_toy_dialog.create_vehicle')"
          multiple
          return-object
          variant="outlined"
        >
          <template #prepend-item>
            <v-list-item
              :title="t('create_toy_dialog.select_all')"
              @click="toggleVehicles"
            >
              <template #prepend>
                <v-checkbox-btn
                  :color="someVehiclesSelected ? 'primary' : undefined"
                  :indeterminate="someVehiclesSelected && !allVehiclesSelected"
                  :model-value="allVehiclesSelected"
                />
              </template>
            </v-list-item>

            <v-divider class="mt-2" />
          </template>
          <template #selection="{ item, index }">
            <v-chip
              v-if="index < 3"
              color="primary"
              :text="item.title"
            />

            <span
              v-if="index === 3"
              class="text-grey text-caption align-self-center"
            >
              ({{
                t('create_toy_dialog.others', {
                  others: selectedVehicles.length - 3
                })
              }})
            </span>
          </template>
          <template #item="{ item, props }">
            <v-list-item
              v-bind="props"
              active-class="text-primary"
              :subtitle="
                t('create_toy_dialog.world', { world: item.raw.world })
              "
            >
              <template #prepend>
                <!-- TODO THIS WOULD BE NICER IF WE WOULD HAVE A DEDICATED FALLBACK IMAGE -->
                <v-avatar>
                  <v-img :src="`/images/${item.raw.id}.png`">
                    <template #error>
                      <v-icon
                        icon="mdi-account"
                        style="height: 100%"
                      />
                    </template>
                    <template #placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          color="primary"
                          indeterminate
                        />
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
        <div class="mt-4 mb-4" />
        <v-btn
          block
          color="primary"
          prepend-icon="mdi-content-save"
          :text="
            t('create_toy_dialog.save', {
              num: selectedCharacters.length + selectedVehicles.length
            })
          "
          @click="create"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Character } from '@/types/character'
  import type { ToyTag } from '@/types/tag'
  import type { Vehicle } from '@/types/vehicles'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import useAxios from '@/composables/useAxios'
  import { useAppStore } from '@/stores/app'

  const { mdAndUp } = useDisplay()
  const { t } = useI18n()
  const appStore = useAppStore()
  const { characterEndpoint, vehicleEndpoint, toyTagEndpoint } = useAxios()

  const active = defineModel<boolean>('active', {
    required: true
  })

  const { toyTags, validCharacters, validVehicles } = storeToRefs(appStore)
  const selectedCharacters = ref<Character[]>([])
  const selectedVehicles = ref<Vehicle[]>([])
  const creating = ref<boolean>(false)
  const snackbar = ref<boolean>(false)

  const numCharactersCreated = ref<number>(0)
  const numVehiclesCreated = ref<number>(0)
  const allCharactersSelected = computed(
    () => selectedCharacters.value.length === characterToSelect.value.length
  )

  const someCharactersSelected = computed(
    () => selectedCharacters.value.length > 0
  )

  const characterToSelect = computed(() => {
    return validCharacters.value.filter(
      (character: Character) =>
        !toyTags.value.some((toyTag: ToyTag) => toyTag.id === character.id)
    )
  })

  const allVehiclesSelected = computed(
    () => selectedVehicles.value.length === vehiclesToSelect.value.length
  )

  const someVehiclesSelected = computed(() => selectedVehicles.value.length > 0)

  const vehiclesToSelect = computed(() => {
    return validVehicles.value.filter(
      (vehicle: Vehicle) =>
        !toyTags.value.some((toyTag: ToyTag) => toyTag.id === vehicle.id)
    )
  })

  const height = computed(() => (mdAndUp ? '700px' : '100%'))
  const width = computed(() => (mdAndUp ? '600px' : '100%'))

  const toggleCharacters = () => {
    if (allCharactersSelected.value) {
      selectedCharacters.value = []
    } else {
      selectedCharacters.value = characterToSelect.value.slice()
    }
  }

  const toggleVehicles = () => {
    if (allVehiclesSelected.value) {
      selectedVehicles.value = []
    } else {
      selectedVehicles.value = vehiclesToSelect.value.slice()
    }
  }

  const create = async () => {
    creating.value = true
    numCharactersCreated.value = await characterEndpoint.createCharacters(
      selectedCharacters.value
    )
    numVehiclesCreated.value = await vehicleEndpoint.createVehicles(
      selectedVehicles.value
    )

    toyTags.value = await toyTagEndpoint.getToyTags()

    creating.value = false
    snackbar.value = true
    active.value = false
  }

  watch(active, (newValue: boolean) => {
    if (newValue) {
      numCharactersCreated.value = 0
      numVehiclesCreated.value = 0
      snackbar.value = false
      selectedCharacters.value = []
      selectedVehicles.value = []
    }
  })
</script>

<style scoped></style>

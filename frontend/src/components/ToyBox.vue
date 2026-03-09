<template>
  <v-dialog
    v-model="showFilter"
    :max-height="height"
    :max-width="width"
    no-click-animation
    persistent
  >
    <v-card :title="t('toybox.filter.title')">
      <template #append>
        <v-icon-btn
          icon="mdi-close"
          @click="showFilter = false"
        />
      </template>
      <v-container class="pt-0">
        <v-row dense>
          <v-col
            class="d-flex align-center"
            cols="4"
          >
            {{ t('toybox.filter.name') }}
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="nameFilter"
              clearable
              density="compact"
              hide-details
              variant="outlined"
            />
          </v-col>
          <v-col
            class="d-flex align-center"
            cols="4"
          >
            {{ t('toybox.filter.world') }}
          </v-col>
          <v-col cols="8">
            <v-autocomplete
              v-model="worldFilter"
              clearable
              density="compact"
              hide-details
              :items="worlds"
              multiple
              variant="outlined"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 2"
                  color="primary"
                  :text="item.title"
                />

                <span
                  v-if="index === 2"
                  class="text-grey text-caption align-self-center"
                >
                  ({{
                    t('toybox.filter.world_overflow', {
                      others: worldFilter.length - 2
                    })
                  }})
                </span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="4">{{ t('toybox.filter.abilities') }}</v-col>
          <v-col
            class="d-flex align-center"
            cols="8"
          >
            <v-autocomplete
              v-model="abilitiesFilter"
              clearable
              density="compact"
              hide-details
              :items="abilities"
              multiple
              variant="outlined"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 2"
                  color="primary"
                  :text="item.title"
                />

                <span
                  v-if="index === 2"
                  class="text-grey text-caption align-self-center"
                >
                  ({{
                    t('toybox.filter.abilities_overflow', {
                      others: abilitiesFilter.length - 2
                    })
                  }})
                </span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12">
            <v-btn
              block
              class="mt-2"
              :disabled="!anyFilterSet"
              prepend-icon="mdi-delete"
              :text="t('toybox.filter.clear')"
              @click="clearFilter"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>

  <v-row dense>
    <v-col
      cols="7"
      lg="8"
    >
      <v-card rounded="xl">
        <v-overlay
          v-model="refreshingToyTags"
          class="justify-center align-center"
          contained
          no-click-animation
          persistent
        >
          <v-card>
            <v-container class="d-flex flex-column justify-center align-center">
              <v-progress-circular
                indeterminate
                size="90"
                width="8"
              />
              <span class="text-high-emphasis text-h6 mt-2">
                {{ t('toy_tags_refresh.loader') }}
              </span>
            </v-container>
          </v-card>
        </v-overlay>
        <draggable
          class="toybox-grid"
          :delay="100"
          :delay-on-touch-only="true"
          group="toytag"
          item-key="id"
          :list="toDisplay"
          @change="handleChange"
        >
          <template #item="{ element }">
            <toy-tag
              height="6em"
              :tag="element"
            />
          </template>
        </draggable>
      </v-card>
    </v-col>
    <v-col
      class="d-flex flex-column align-center"
      cols="5"
      lg="4"
    >
      <delete-toy-tag />
      <div class="mt-2 mb-2" />

      <v-btn
        prepend-icon="mdi-plus"
        :text="t('toybox.create_toy')"
        @click="createDialog = true"
      />

      <div class="mt-2">
        <v-btn
          :color="anyFilterSet ? 'primary' : undefined"
          prepend-icon="mdi-filter-variant"
          :text="t('toybox.filter.show')"
          @click="showFilter = true"
        />
        <v-fade-transition>
          <v-icon-btn
            v-if="anyFilterSet"
            class="ms-2"
            icon="mdi-delete-empty"
            size="small"
            variant="plain"
            @click="clearFilter"
          />
        </v-fade-transition>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { ToyTag } from '@/types/tag'
  import { useI18n } from 'vue-i18n'
  import Draggable from 'vuedraggable'
  import { useDisplay } from 'vuetify'
  import useAxios from '@/composables/useAxios'
  import useSocket from '@/composables/useSocket'
  import { useAppStore } from '@/stores/app'

  const { t } = useI18n()
  const { mdAndUp } = useDisplay()
  const appStore = useAppStore()
  const { refreshingToyTags } = useSocket()
  const { toyTagEndpoint } = useAxios()

  const createDialog = defineModel<boolean>('createDialog', {
    required: true
  })

  const unusedToyTags = defineModel<ToyTag[]>('toyTags', {
    required: true
  })

  const { abilities, worlds } = storeToRefs(appStore)
  const showFilter = ref<boolean>(false)
  const nameFilter = ref<string>()
  const abilitiesFilter = ref<string[]>([])
  const worldFilter = ref<string[]>([])

  const height = computed(() => (mdAndUp ? '700px' : '100%'))
  const width = computed(() => (mdAndUp ? '600px' : '100%'))

  // APPLY ABILITIES AND WORLD FILTER
  const toDisplay = computed(() => {
    if (!anyFilterSet.value) {
      return unusedToyTags.value
    }

    return unusedToyTags.value.filter((tag: ToyTag) => {
      // Name filter
      let result = true
      if (nameFilter.value) {
        result &&= tag.name
          .toLowerCase()
          .includes(nameFilter.value.toLowerCase())
      }

      // Abilities filter
      if ((abilitiesFilter.value?.length ?? 0) > 0) {
        result &&= appStore.hasAnyAbility(tag.id, abilitiesFilter.value)
      }

      if ((worldFilter.value?.length ?? 0) > 0) {
        result &&= appStore.belongsToAnyWorld(tag.id, worldFilter.value)
      }

      return result
    })
  })

  const anyFilterSet = computed(() => {
    return (
      !!nameFilter.value ||
      (worldFilter.value?.length ?? 0) > 0 ||
      (abilitiesFilter.value?.length ?? 0) > 0
    )
  })

  const handleChange = async (event: any) => {
    if ('added' in event) {
      const element = event['added'].element
      const oldIndex = element.index
      element.index = -1
      const removed = await toyTagEndpoint.removeToyTag(element.uid, oldIndex)
      if (!removed) {
        element.index = oldIndex
      }
    }
  }

  const clearFilter = () => {
    nameFilter.value = undefined
    worldFilter.value = []
    abilitiesFilter.value = []
  }
</script>

<style scoped lang="scss">
  .toybox-grid {
    height: 300px;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(6em, 1fr));
    gap: 0.3em;
    padding: 0.5em;
    overflow: auto;
    border-radius: 30px;
  }
</style>

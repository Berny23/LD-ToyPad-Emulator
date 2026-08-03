<template>
  <v-sheet
    color="red-lighten-1"
    max-width="10rem"
    rounded="xl"
    style="aspect-ratio: 1"
    width="120px"
  >
    <Draggable
      v-model="list"
      class="delete-pad"
      :delay="100"
      group="toytag"
      item-key="id"
      :sort="false"
      @change="onPadDrop"
    >
      <template #header>
        <v-icon icon="mdi-trash-can" />
      </template>
      <template #item="{ element }">deleting {{ element.id }}</template>
    </Draggable>
  </v-sheet>
</template>

<script setup lang="ts">
  import type { ToyTag } from '@/types/tag'
  import Draggable from 'vuedraggable'
  import useSocket from '@/composables/useSocket'
  import { useAppStore } from '@/stores/app'

  const { deleteToken } = useSocket()

  const appStore = useAppStore()
  const { toyTags } = storeToRefs(appStore)

  const list = ref<ToyTag[]>([])
  const onPadDrop = (event: any) => {
    if ('added' in event) {
      const toDelete = event['added'].element as ToyTag
      toyTags.value = toyTags.value.filter((x: ToyTag) => x.id !== toDelete.id)
      deleteToken(toDelete.uid)
      list.value = []
    }
  }
</script>

<style scoped lang="scss">
  .delete-pad {
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>

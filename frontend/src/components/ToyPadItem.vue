<template>
  <Draggable
    class="pad"
    :delay="100"
    delay-on-touch-only
    :disabled="!connected"
    group="toytag"
    item-key="id"
    :model-value="tag"
    :sort="false"
    :style="`height: ${height}; aspect-ratio: 1;`"
    @change="onPadDrop"
  >
    <template #item="{ element }">
      <toy-tag :tag="element" />
    </template>
  </Draggable>
</template>

<script setup lang="ts">
  import type { ToyTag } from '@/types/tag'
  import Draggable from 'vuedraggable'
  import useAxios from '@/composables/useAxios'
  import useSocket from '@/composables/useSocket'

  const { toyTagEndpoint } = useAxios()
  const { connected } = useSocket()

  const tag = defineModel<ToyTag[]>('tag', {
    required: true,
    default: []
  })

  const {
    height = '100%',
    index,
    position
  } = defineProps<{
    height?: string
    width?: string
    index: number
    position: number
  }>()

  // TODO FUNCTIONALITY TO SWITCH ELEMENTS BETWEEN PADS
  const handleAdd = async (element: ToyTag) => {
    console.log('try adding tag', element, 'to pad', index)
    // Source - https://stackoverflow.com/a/39914235
    // Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-03-02, License - CC BY-SA 4.0
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const oldIndex = element.index
    element.index = index
    let anyNotRemoved = false
    for (const x of tag.value ?? []) {
      if (x.index == -1) {
        continue
      }
      console.log(x)
      const removed = await toyTagEndpoint.removeToyTag(x.uid, x.index)
      sleep(500)
      if (removed) {
        x.index = -1
      }
      anyNotRemoved ||= !removed
    }

    if (anyNotRemoved) {
      element.index = oldIndex
      // TODO ERROR?
      console.error(
        'there was a tag on the new index',
        index,
        'that could not be removed'
      )
      return
    }
    console.log(element.index, oldIndex)
    // TODO BACKEND RETURNS CURR INDEX AS STRING
    if (oldIndex != -1) {
      const removed = await toyTagEndpoint.removeToyTag(element.uid, oldIndex)
      sleep(500)
      if (!removed) {
        element.index = oldIndex
        return
      }
    }

    const placed = await toyTagEndpoint.placeToyTag(element, index, position)
    if (!placed) {
      element.index = -1
      console.error('couldnt move toytag', index, 'leaving at old index', -1)
    }
  }

  const onPadDrop = (event: any) => {
    if ('added' in event) {
      handleAdd(event['added'].element)
      return
    }
  }
</script>

<style scoped>
  .pad {
    display: flex;
  }
</style>

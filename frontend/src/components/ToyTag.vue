<template>
  <v-sheet
    v-tooltip:top="tag?.name"
    :height="height"
    rounded="circle"
    style="aspect-ratio: 1"
  >
    <v-img
      :height="height"
      rounded="circle"
      :src="`/images/${tag?.id}.png`"
      style="pointer-events: none; aspect-ratio: 1"
    >
      <template #error>
        <v-sheet
          class="d-flex align-center justify-center"
          color="orange"
          height="100%"
        >
          <span class="text-center text-break">{{ tag?.name }}</span>
        </v-sheet>
      </template>
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular
            color="primary"
            indeterminate
          />
        </div>
      </template>
    </v-img>
  </v-sheet>
</template>

<script setup lang="ts">
  import type { ToyTag } from '@/types/tag'

  const { tag = null, height = '100%' } = defineProps<{
    tag?: ToyTag
    height?: string | number
  }>()
</script>

<style scoped></style>

// Utilities
import type { Character } from '@/types/character'
import type { ToyTag } from '@/types/tag'
import type { Vehicle } from '@/types/vehicles'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ---------- State ----------
  const toyTags = ref<ToyTag[]>([])
  const characters = ref<Character[]>([])
  const vehicles = ref<Vehicle[]>([])

  // ---------- Actions ----------
  const removeTag = (id: number) => {
    toyTags.value = toyTags.value.filter((tag: ToyTag) => tag.id !== id)
  }

  const addTag = (tag: ToyTag) => {
    toyTags.value.push(tag)
  }

  const hasAnyAbility = (tagId: number, selected: string[]) => {
    console.log(tagId, selected)
    // do not apply the filter if the user filters for nothing
    if (selected.length === 0) {
      return true
    }

    const source =
      characters.value.find((c: Character) => c.id === tagId) ??
      vehicles.value.find((v: Vehicle) => v.id === tagId)

    if (!source?.abilities) {
      return false
    }
    const tagAbilities = new Set(
      source.abilities.split(',').map((a: string) => a.trim().toLowerCase())
    )
    return selected.some((a: string) => tagAbilities.has(a.toLowerCase()))
  }

  const belongsToAnyWorld = (tagId: number, selected: string[]) => {
    if (selected.length === 0) {
      return true
    }

    const source =
      characters.value.find((c: Character) => c.id === tagId) ??
      vehicles.value.find((v: Vehicle) => v.id === tagId)

    console.log(source)
    if (!source?.world) {
      return false
    }

    const world = source.world
    console.log(selected, world)
    return selected.includes(world)
  }

  // ---------- Getters ----------
  const validCharacters = computed(() =>
    characters.value.filter(
      (character: Character) =>
        !character.name.toLowerCase().includes('unreleased') &&
        !character.name.toLowerCase().includes('unknown') &&
        !character.name.toLowerCase().includes('n/a')
    )
  )

  const validVehicles = computed(() =>
    vehicles.value.filter((vehicle: Vehicle) => vehicle.name !== 'Unknown')
  )

  const abilities = computed(() => [
    ...new Set([
      ...validCharacters.value.flatMap((c: Character) =>
        c.abilities.split(',')
      ),
      ...validVehicles.value.flatMap((v: Vehicle) => v.abilities.split(','))
    ])
  ])

  const worlds = computed(() => [
    ...new Set([
      ...validCharacters.value.map((c: Character) => c.world),
      ...validVehicles.value.map((v: Vehicle) => v.world)
    ])
  ])

  return {
    toyTags,
    characters,
    vehicles,
    removeTag,
    addTag,
    hasAnyAbility,
    belongsToAnyWorld,
    validCharacters,
    validVehicles,
    abilities,
    worlds
  }
})

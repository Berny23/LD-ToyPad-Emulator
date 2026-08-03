// src/composables/useSocket.ts
import type { ToyTag } from '@/types/tag'
import { useNotification } from '@kyvg/vue3-notification'
import { io, type Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref } from 'vue'
import i18n from '@/plugins/i18n'
import { useAppStore } from '@/stores/app'
import useAxios from './useAxios'

let socket: Socket | null = null
let listenersAttached = false
const gameConnected = ref(false)

type Anim = {
  transition?: string
  color: string
}

const padColors = ref<Record<number, Anim | null>>({
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null
})

const normalizeColor = (
  color: string,
  options: { normalizeWhite?: boolean } = {}
): string => {
  if (color === '#000000') {
    return '#d8d7d8'
  } else if (options.normalizeWhite && color === '#ffffff') {
    return `color-mix(in srgb, #000000, #808080 60%)`
  } else {
    return `color-mix(in srgb, ${color}, #808080 60%)`
  }
}

export default function useSocket() {
  const refreshingToyTags = ref<boolean>(false)
  // Reactive state you want to update from socket
  // Connect and set up listeners
  const connect = () => {
    if (!socket) {
      socket = io()
    }
    if (socket?.connected || listenersAttached) {
      return
    }

    socket.on('connect', () => {
      getConnectionStatus()
      console.log('Socket connected:', socket!.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('refreshTokens', () => {
      const { notify } = useNotification()
      refreshingToyTags.value = true
      console.log('Tokens should refresh!')
      const { toyTagEndpoint } = useAxios()
      const appStore = useAppStore()
      toyTagEndpoint.getToyTags().then((tags: ToyTag[]) => {
        appStore.toyTags = tags
        notify({
          title: i18n.global.t('toy_tags_refresh.title'),
          type: 'success'
        })
        refreshingToyTags.value = false
      })
    })

    // TODO TEST COLOR FADING
    // HOW DOES IT RESET TO WHITE?
    socket.on('Fade One', (e: any[]) => {
      console.log('IO Received: Fade One')
      const groups = [[2], [1, 4, 5], [3, 6, 7]]
      const pad = e[0] - 1
      const speed = e[1]
      const color = normalizeColor(e[3])

      for (const index of groups[pad] ?? []) {
        padColors.value[index] = {
          color,
          transition: `background-color ${speed * 50}ms ease-in-out`
        }
      }
    })

    socket.on('Fade All', (e: any[]) => {
      console.log('IO Received: Fade All')
      const speed = e[0] // Speed multiplier
      for (const index of [1, 2, 3, 4, 5, 6, 7]) {
        // Determine target color based on your logic
        let color: string
        if ([1, 4, 5].includes(index)) {
          color = e[5]
        } else if ([3, 6, 7].includes(index)) {
          color = e[8]
        } else {
          color = e[2]
        }
        // basically we want black to flip back to the original white background

        padColors.value[index] = {
          color: normalizeColor(color, {
            normalizeWhite: false
          }),
          transition: `background-color ${speed * 50}ms ease-in-out`
        }
      }
    })

    socket.on('Color One', (e: any[]) => {
      console.log('IO Received: Color one')
      const groups = [[2], [1, 4, 5], [3, 6, 7]]
      const pad = e[0] - 1
      const color = normalizeColor(e[1])

      for (const index of groups[pad] ?? []) {
        padColors.value[index] = {
          color,
          transition: 'background-color 250ms ease-out'
        }
      }
    })

    socket.on('Color All', (e: any[]) => {
      console.log('IO Received: Color all', e)
      for (const index of [1, 2, 3, 4, 5, 6, 7]) {
        let color: string
        if ([1, 4, 5].includes(index)) {
          color = e[0]
        } else if ([3, 6, 7].includes(index)) {
          color = e[1]
        } else {
          color = e[2]
        }
        padColors.value[index] = {
          color: normalizeColor(color),
          transition: 'background-color 250ms ease-out'
        }
      }
    })

    socket.on('Connection True', () => {
      console.log('Game Connected')
      gameConnected.value = true
    })

    socket.connect()

    listenersAttached = true
  }

  // Emit helpers
  const deleteToken = (uid: string) => {
    socket?.emit('deleteToken', uid)
  }
  const syncPad = (pad: any) => {
    socket?.emit('syncToyPad', pad)
  }
  const getConnectionStatus = () => {
    socket?.emit('connectionStatus')
  }

  // Automatically clean up listeners when component using this unmounts
  onUnmounted(() => {
    gameConnected.value = false
    socket?.off('connect')
    socket?.off('disconnect')
    socket?.off('Color All')
    socket?.off('refreshTokens')
    socket?.off('Connection True')
    socket?.off('Color All')
    socket?.off('Color One')
    socket?.off('Fade All')
    socket?.off('Fade One')
  })

  // Optional: auto-connect on mount
  onMounted(connect)

  return {
    socket,
    connected: gameConnected,
    padColors,
    refreshingToyTags,
    deleteToken,
    syncPad,
    connect
  }
}

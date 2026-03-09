/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
// Types
import type { App } from 'vue'

// Plugins
import Notifications from '@kyvg/vue3-notification'
import router from '../router'
import pinia from '../stores'
import i18n from './i18n'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app.use(Notifications).use(vuetify).use(router).use(pinia).use(i18n)
}

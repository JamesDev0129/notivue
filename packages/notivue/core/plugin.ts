import { createStore } from './createStore'
import { storeInjectionKey } from './symbols'

import type { Plugin } from 'vue'
import type { NotivueConfig } from '@/types'

export const notivue: Plugin = {
   install(app, config: NotivueConfig = {}) {
      app.provide(storeInjectionKey, createStore(config))
   },
}

<div align="center">

![notivue](https://i.ibb.co/DKmV9Xj/cover.png)

### Fully-featured notification system for Vue and Nuxt.

[Live Demo](https://notivue.netlify.app) - [Documentation](https://notivuedocs.netlify.app) - [Vite Example](https://stackblitz.com/edit/vitejs-vite-kdrtrw?file=src/components/Example.vue) - [Nuxt Example](https://stackblitz.com/edit/nuxt-starter-fnhcmx?file=app.vue)

</div>

<br />

## Features

**🧬 JS and CSS modular**  
_Granularly include only the features you need_

**🧚‍♂️ Zero deps and lightweight**  
_From ~3.5 KB (gzipped)_

**🎢 Slick transitions and animations**  
_Customize any animation_

**🧩 Custom Components API**  
_Use your own components while Notivue handles the rest_

**🌀 Promise API**  
_Update pending notifications with ease_

**🔰 Includes a ready-made component with anything you need**  
_Themes, icons, animations, rtl support and much more_

**♿️ Fully accessible**  
_Accessible notifications to everyone_

<br />

## Installation

```bash
pnpm add notivue
```

<br />

## Vite / Vue CLI

### 1. Configure

**main.js/ts**

```js
import { createApp } from 'vue'
import { notivue } from 'notivue'

import App from './App.vue'

import 'notivue/notifications.css' // Only needed if using built-in notifications
import 'notivue/animations.css' // Only needed if using built-in animations

const app = createApp(App)

app.use(notivue)
app.mount('#app')
```

**App.vue**

```vue
<script setup>
import { Notivue, Notifications } from 'notivue'
</script>

<template>
  <Notivue v-slot="item">
    <Notifications :item="item" />
  </Notivue>

  <!-- ... -->
</template>
```

### 2. Push notifications from any component

```vue
<script setup>
import { usePush } from 'notivue'

const push = usePush()
</script>

<template>
  <button @click="push.success('Something good has been pushed!')">Push</button>
</template>
```

<br />

## Nuxt 3

### 1. Configure

**plugins/notivue.client.ts** (create _/plugins_ folder if it doesn't exist)

```ts
import { notivue } from 'notivue'

export default defineNuxtPlugin(({ vueApp }) => vueApp.use(notivue))
```

**nuxt.config.ts**

```ts
export default defineNuxtConfig({
  css: ['notivue/notifications.css', 'notivue/animations.css']
})
```

**App.vue** (wrap `<Notivue />` in a [ClientOnly](https://nuxt.com/docs/api/components/client-only) component)

```vue
<script setup>
import { Notivue, Notifications } from 'notivue'
</script>

<template>
  <ClientOnly>
    <Notivue v-slot="item">
      <Notifications :item="item" />
    </Notivue>
  </ClientOnly>

  <!-- ... -->
</template>
```

### 2. Push notifications from any component

```vue
<script setup>
import { usePush } from 'notivue'

const push = usePush()
</script>

<template>
  <button @click="push.success('Something good has been pushed!')">Push</button>
</template>
```

<br />

## Links

[Live Demo](https://notivue.netlify.app) - [Documentation](https://notivuedocs.netlify.app) - [Vite Example](https://stackblitz.com/edit/vitejs-vite-kdrtrw?file=src/components/Example.vue) - [Nuxt Example](https://stackblitz.com/edit/nuxt-starter-fnhcmx?file=app.vue)

<br />

## Thanks

- [Ionic Team](https://ionic.io/) for the icon sets
- [Uktash Verna](https://github.com/n3r4zzurr0) for the SVG spinner

<br />

## License

MIT Licensed - Simone Mastromattei © 2023

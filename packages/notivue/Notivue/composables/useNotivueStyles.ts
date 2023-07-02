import { computed, type CSSProperties } from 'vue'

import { useConfig } from '@/core/useStore'
import { useReducedMotion } from './useReducedMotion'

import type { NotivueElements } from '@/types'

/**
 * The follwing styles are not defined in a CSS file because
 * they are needed whether user uses default or custom components.
 *
 * Hence if users choose to only use custom components they can
 * remove the /notifications.css import and have no CSS at all.
 */

const NO_DUR = '0ms !important'

const absolute: CSSProperties = { position: 'absolute' }
const boxSizing: CSSProperties = { boxSizing: 'border-box' }
const noMargin: CSSProperties = { margin: '0' }
const flex: CSSProperties = { display: 'flex' }
const flexCenter: CSSProperties = { ...flex, justifyContent: 'center' }

const nvZ = 'var(--nv-z, 500)'
const nvGap = 'var(--nv-gap, 0.75rem)'

const rootWidth = 'var(--nv-root-width, 100%)'
const rootOffsets = {
   top: 'var(--nv-root-top, 1.25rem)',
   right: 'var(--nv-root-right, 1.25rem)',
   bottom: 'var(--nv-root-bottom, 1.25rem)',
   left: 'var(--nv-root-left, 1.25rem)',
}

export const visuallyHidden: CSSProperties = {
   ...absolute,
   clip: 'rect(0 0 0 0)',
   clipPath: 'inset(50%)',
   height: '1px',
   overflow: 'hidden',
   whiteSpace: 'nowrap',
   width: '1px',
}

const staticStyles: Record<NotivueElements, CSSProperties> = {
   ol: {
      ...boxSizing,
      ...flexCenter,
      ...noMargin,
      zIndex: nvZ,
      maxWidth: rootWidth,
      padding: '0',
      listStyle: 'none',
      position: 'fixed',
      pointerEvents: 'none',
      inset: Object.values(rootOffsets).join(' '),
   },
   li: {
      ...boxSizing,
      ...noMargin,
      ...flex,
      ...absolute,
      position: 'absolute',
      transitionProperty: 'transform',
      width: '100%',
   },
   item: {
      ...boxSizing,
      padding: `0 0 ${nvGap} 0`,
      pointerEvents: 'auto',
      maxWidth: '100%',
   },
}

export function useNotivueStyles() {
   const config = useConfig()
   const isReduced = useReducedMotion()

   /** Simulates overflow-hidden only on the opposite side of the current vertical align.
    * This will not clip enter animations but will contain the stream vertically.
    */
   const clipPath = computed<CSSProperties>(() => {
      const clipInset = Object.values(rootOffsets).map((value) => `calc(-1 * ${value})`)

      config.isTopAlign.value ? clipInset.splice(2, 1, '0px') : clipInset.splice(0, 1, '0px')

      return { clipPath: `inset(${clipInset.join(' ')})` }
   })

   const isAlignedTo = (value: string) => config.position.value.endsWith(value)
   const xAlignment = computed<CSSProperties>(() => ({
      justifyContent: `var(--nv-root-x-align, ${
         isAlignedTo('left') ? 'flex-start' : isAlignedTo('right') ? 'flex-end' : 'center'
      })`,
   }))

   return computed<Record<NotivueElements, CSSProperties>>(() => ({
      ol: { ...staticStyles.ol, ...clipPath.value },
      li: {
         ...staticStyles.li,
         ...xAlignment.value,
         ...(config.isTopAlign.value ? { top: '0px' } : { bottom: '0px' }),
         ...(isReduced.value ? { transitionDuration: NO_DUR } : {}),
      },
      item: {
         ...staticStyles.item,
         ...(isReduced.value ? { animationDuration: NO_DUR } : {}),
      },
   }))
}

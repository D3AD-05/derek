import { onMounted, onBeforeUnmount } from 'vue'

export function usePreventRefresh(shouldWarn: () => boolean) {
  const handler = (e: BeforeUnloadEvent) => {
    if (!shouldWarn()) return

    e.preventDefault()
    e.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handler)
  })
}

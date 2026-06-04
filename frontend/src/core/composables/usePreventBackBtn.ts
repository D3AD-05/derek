import { onMounted, onBeforeUnmount } from 'vue'

export function useDisableBack() {
  const handlePopState = () => {
    history.pushState(null, '', location.href)
  }

  onMounted(() => {
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', handlePopState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopState)
  })
}

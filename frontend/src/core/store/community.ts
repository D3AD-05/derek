import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getStoredCommunityId, setStoredCommunityId } from '@/core/api/community'

export const useCommunityStore = defineStore('community', () => {
  const selectedCommunityId = ref<number | null>(getStoredCommunityId())

  const communityId = computed(() => selectedCommunityId.value)

  function setCommunityId(id: number | null) {
    selectedCommunityId.value = id
    setStoredCommunityId(id)
  }

  function ensureValidSelection(availableIds: number[]) {
    if (!availableIds || availableIds.length === 0) {
      setCommunityId(null)
      return
    }

    const current = selectedCommunityId.value
    if (current != null && availableIds.includes(current)) return

    setCommunityId(availableIds[0] ?? null)
  }

  return {
    selectedCommunityId,
    communityId,
    setCommunityId,
    ensureValidSelection,
  }
})

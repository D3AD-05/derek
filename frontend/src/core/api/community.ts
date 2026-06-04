const STORAGE_KEY = 'derek.community_id'

export const COMMUNITY_ID_HEADER = 'Community-Id'

export function shouldAttachCommunityId(url?: string): boolean {
  if (!url) return false
  // Avoid attaching to auth endpoints by default
  return !url.startsWith('auth') && !url.startsWith('/auth')
}

export function attachCommunityIdParam(
  params: Record<string, any> | undefined,
  communityId: number | null | undefined,
): Record<string, any> | undefined {
  if (communityId == null) return params

  return {
    ...params,
    community_id: communityId,
  }
}

export function getStoredCommunityId(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setStoredCommunityId(id: number | null): void {
  try {
    if (id == null) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // ignore storage errors (private mode, blocked storage, etc.)
  }
}

export function attachCommunityIdHeader(
  headers: Record<string, any> | undefined,
  communityId: number | null | undefined,
): Record<string, any> | undefined {
  if (communityId == null) return headers

  return {
    ...headers,
    [COMMUNITY_ID_HEADER]: communityId,
  }
}

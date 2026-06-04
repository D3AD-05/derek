type WsHandlers<T> = {
  onOpen?: () => void
  onClose?: (ev: CloseEvent) => void
  onError?: (ev: Event) => void
  onMessage?: (msg: T, raw: MessageEvent) => void
  onText?: (text: string, raw: MessageEvent) => void
}

function getWsBaseUrl(): string {
  const url = import.meta.env.VITE_WS_URL

  if (!url) {
    throw new Error('VITE_WS_URL is not defined. Please set it in your .env file.')
  }

  return url.replace(/\/+$/, '') // remove trailing slash
}

export function createJsonWebSocket<TMessage>(path: string, handlers: WsHandlers<TMessage> = {}) {
  const base = getWsBaseUrl()

  const url = path.startsWith('ws://') || path.startsWith('wss://') ? path : `${base}${path}`

  // ^ Becomes 101 switching  -> connection ->WS
  const ws = new WebSocket(url)

  ws.onopen = () => handlers.onOpen?.()
  ws.onclose = (ev) => handlers.onClose?.(ev)
  ws.onerror = (ev) => handlers.onError?.(ev)

  ws.onmessage = (raw) => {
    const text = typeof raw.data === 'string' ? raw.data : ''
    if (!text) return

    handlers.onText?.(text, raw)

    try {
      const parsed = JSON.parse(text) as TMessage
      handlers.onMessage?.(parsed, raw)
    } catch {
      console.log('Invalid Json ')
    }
  }

  return {
    ws,
    close: (code?: number, reason?: string) => ws.close(code, reason),
    sendJson: (payload: unknown) => ws.send(JSON.stringify(payload)),
  }
}

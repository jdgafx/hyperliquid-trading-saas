"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const WS_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_WS_URL ??
      (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
        /^http/,
        "ws"
      ))
    : "ws://localhost:8000"

export type WSStatus = "connecting" | "connected" | "disconnected" | "error"

interface UseWebSocketOptions<T> {
  /** WebSocket path, e.g. "/liquidations/ws" */
  path: string
  /** Auto-connect on mount (default: true) */
  enabled?: boolean
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number
  /** Max reconnect attempts (default: 10) */
  maxReconnects?: number
  /** Transform incoming messages */
  onMessage?: (data: T) => void
}

interface UseWebSocketReturn<T> {
  status: WSStatus
  lastMessage: T | null
  messages: T[]
  send: (data: unknown) => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket<T = unknown>({
  path,
  enabled = true,
  reconnectDelay = 3000,
  maxReconnects = 10,
  onMessage,
}: UseWebSocketOptions<T>): UseWebSocketReturn<T> {
  const [status, setStatus] = useState<WSStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<T | null>(null)
  const [messages, setMessages] = useState<T[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCount = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      wsRef.current.onerror = null
      wsRef.current.onclose = null
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close()
      }
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    cleanup()
    setStatus("connecting")

    const url = `${WS_BASE}${path}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus("connected")
      reconnectCount.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data: T = JSON.parse(event.data)
        setLastMessage(data)
        setMessages((prev) => {
          const next = [...prev, data]
          return next.length > 200 ? next.slice(-100) : next
        })
        onMessageRef.current?.(data)
      } catch {
        // non-JSON message, ignore
      }
    }

    ws.onerror = () => {
      setStatus("error")
    }

    ws.onclose = () => {
      setStatus("disconnected")
      if (reconnectCount.current < maxReconnects) {
        reconnectCount.current += 1
        reconnectTimer.current = setTimeout(connect, reconnectDelay)
      }
    }
  }, [path, cleanup, reconnectDelay, maxReconnects])

  const disconnect = useCallback(() => {
    reconnectCount.current = maxReconnects // prevent auto-reconnect
    cleanup()
    setStatus("disconnected")
  }, [cleanup, maxReconnects])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      connect()
    }
    return cleanup
  }, [enabled, connect, cleanup])

  return { status, lastMessage, messages, send, connect, disconnect }
}

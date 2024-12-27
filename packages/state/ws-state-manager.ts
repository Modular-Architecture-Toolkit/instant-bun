import type { ServerWebSocket, WebSocketHandler } from 'bun'
import type { createStateManager } from './state-manager'

export const createWSStateHandler = <State extends object>(
  stateMachine: ReturnType<typeof createStateManager<State>>
) => {
  const connectedClients = new Set<ServerWebSocket>()

  const websocketHandler: WebSocketHandler = {
    open: (ws) => {
      connectedClients.add(ws)
    },
    close: (ws) => {
      connectedClients.delete(ws)
    },
    message: (ws, msg) => {
      if (typeof msg !== 'string') return

      const data: { key: keyof State; value: State[keyof State] } = JSON.parse(msg)

      if (data.key in stateMachine.state) {
        stateMachine.updateStateAndDispatch(data.key, data.value)
      }
    },
  }

  // Watch state changes and broadcast to connected clients
  for (const key in stateMachine.state) {
    stateMachine.onStateChange(key, (newValue) => {
      const updatedStateData = {
        key,
        value: newValue,
      }

      for (const client of connectedClients) {
        client.send(JSON.stringify(updatedStateData))
      }
    })
  }

  stateMachine.subscribe(() => {
    for (const key in stateMachine.state) {
      const newValue = stateMachine.state[key]
      const updatedStateData = {
        key,
        value: newValue,
      }
      for (const client of connectedClients) {
        client.send(JSON.stringify(updatedStateData))
      }
    }
  })

  return websocketHandler
}

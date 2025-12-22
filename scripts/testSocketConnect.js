import { io } from 'socket.io-client'

const url = 'http://194.238.17.182:7000'
const token = process.env.TOKEN || null

const socket = io(url, {
  auth: token ? { token } : undefined,
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: false,
})

socket.on('connect', () => {
  console.log('[socket] connected', socket.id)
  socket.disconnect()
  process.exit(0)
})

socket.on('connect_error', (err) => {
  console.error('[socket] connect_error', err)
  process.exit(2)
})

socket.on('disconnect', (reason) => {
  console.log('[socket] disconnected', reason)
  process.exit(0)
})

setTimeout(() => {
  console.error('[socket] did not connect in 5s')
  process.exit(3)
}, 5000)

import { createServer, request } from 'node:http'
import { connect } from 'node:net'

const listenHost = '127.0.0.1'
const listenPort = Number(process.env.PUBLIC_PREVIEW_PORT ?? 3001)
const originHost = '127.0.0.1'
const originPort = Number(process.env.PUBLIC_PREVIEW_ORIGIN_PORT ?? 3000)

function isBlocked(url = '/') {
  const pathname = new URL(url, 'http://localhost').pathname
  const isPublicApi =
    pathname.startsWith('/api/media/file/') || pathname === '/api/telegram/webhook'

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  if (pathname.startsWith('/api/') && !isPublicApi) return true

  return false
}

function reject(response) {
  response.writeHead(404, {
    'cache-control': 'no-store',
    'content-type': 'text/plain; charset=utf-8',
  })
  response.end('Not found')
}

const server = createServer((incoming, outgoing) => {
  if (isBlocked(incoming.url)) {
    reject(outgoing)
    return
  }

  const proxy = request(
    {
      hostname: originHost,
      port: originPort,
      path: incoming.url,
      method: incoming.method,
      headers: incoming.headers,
    },
    (response) => {
      outgoing.writeHead(response.statusCode ?? 502, response.headers)
      response.pipe(outgoing)
    },
  )

  proxy.on('error', (error) => {
    if (!outgoing.headersSent) outgoing.writeHead(502, { 'content-type': 'text/plain' })
    outgoing.end(`Preview origin unavailable: ${error.message}`)
  })

  incoming.pipe(proxy)
})

server.on('upgrade', (request, socket, head) => {
  if (isBlocked(request.url)) {
    socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n')
    return
  }

  const upstream = connect(originPort, originHost, () => {
    const headers = Object.entries(request.headers)
      .flatMap(([name, value]) =>
        Array.isArray(value) ? value.map((item) => `${name}: ${item}`) : [`${name}: ${value ?? ''}`],
      )
      .join('\r\n')

    upstream.write(`${request.method} ${request.url} HTTP/${request.httpVersion}\r\n${headers}\r\n\r\n`)
    if (head.length > 0) upstream.write(head)
    socket.pipe(upstream).pipe(socket)
  })

  upstream.on('error', () => socket.destroy())
})

server.listen(listenPort, listenHost, () => {
  console.log(`Public preview proxy: http://${listenHost}:${listenPort}`)
  console.log(`Preview origin: http://${originHost}:${originPort}`)
  console.log('Payload admin and private API routes are blocked.')
})

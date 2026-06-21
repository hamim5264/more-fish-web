import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const clientDebugPlugin = () => ({
  name: 'client-debug-terminal',
  configureServer(server: any) {
    server.middlewares.use('/__client-debug', (req: any, res: any) => {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const entry = JSON.parse(body)
          const details = entry.details ? ` ${JSON.stringify(entry.details)}` : ''
          const line = `[client:${entry.level || 'info'}] ${entry.message || 'Unknown client message'}${details}`
          if (entry.level === 'error') server.config.logger.error(line)
          else server.config.logger.info(line)
        } catch (error) {
          server.config.logger.error(`[client:error] Invalid debug payload: ${String(error)}`)
        }
        res.statusCode = 204
        res.end()
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), clientDebugPlugin()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
      '/devices': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
      '/cattle_care': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
      '/poultry_care': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
      '/product': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
      '/notification': {
        target: 'http://66.29.151.40:8004',
        changeOrigin: true,
      },
    }
  }
})

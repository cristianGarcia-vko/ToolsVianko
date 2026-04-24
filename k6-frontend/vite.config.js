import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_SERVER_PORT || env.VITE_PORT || 4010)

  return {
    plugins: [react()],
    base: './',
    server: {
      port: Number.isFinite(devPort) ? devPort : 4010,
    },
  }
})

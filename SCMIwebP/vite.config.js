import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        founders: resolve(__dirname, 'founders.html'),
        whatToExpect: resolve(__dirname, 'what-to-expect.html')
      }
    }
  }
})

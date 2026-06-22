import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// For GitHub Pages the site is served from https://<user>.github.io/<repo>/
// so assets must be resolved under that sub-path. Change '/coveo-copydeck/'
// if you rename the repository.
export default defineConfig({
  plugins: [vue()],
  base: '/coveo-copydeck/'
})

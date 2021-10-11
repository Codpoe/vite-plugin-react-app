import { defineConfig } from 'vite';
import reactApp from 'vite-plugin-react-app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactApp()],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite設定ファイル
// Reactプラグインを有効化
export default defineConfig({
  plugins: [react()],
});

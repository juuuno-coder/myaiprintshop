import { defineConfig } from '@apps-in-toss/web-framework/config';
export default defineConfig({ appName: 'goodzz', brand: { displayName: 'AI 굿즈 제작소', primaryColor: '#FF6B9D', icon: 'https://vibers.co.kr/favicon.ico' }, web: { host: 'localhost', port: 3430, commands: { dev: 'vite', build: 'vite build' } }, permissions: [], webViewProps: { type: 'partner' } });

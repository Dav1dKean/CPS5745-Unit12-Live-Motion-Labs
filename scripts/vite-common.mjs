import { serveLiveData } from './live-response.mjs';
function liveAPI() {
  const install = (server) => {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/api/data/')) return next();
      await serveLiveData(req, res, url.pathname.slice(10), url.searchParams.get('mode'));
    });
  };
  return {
    name: 'live-only-data',
    configureServer: install,
    configurePreviewServer: install,
  };
}
export function labConfig(plugins, port) {
  return {
    base: process.env.DEPLOY_PUBLIC === '1' ? `/labs/${port - 5280}/` : '/',
    plugins: [...plugins, liveAPI()],
    server: { host: '127.0.0.1', port, strictPort: true },
    preview: { host: '127.0.0.1', port, strictPort: true },
    build: { target: 'es2022' },
    clearScreen: false,
  };
}

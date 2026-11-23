import { serveLiveData } from '../../scripts/live-response.mjs';

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const key = url.pathname.split('/').at(-1);
  await serveLiveData(req, res, key, url.searchParams.get('mode'));
}

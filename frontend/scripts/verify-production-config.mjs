import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const apiSource = readFileSync(join(root, 'src', 'api.ts'), 'utf8');
const envExample = readFileSync(join(root, '.env.example'), 'utf8');

const localhostPattern = /localhost|127\.0\.0\.1|10\.0\.2\.2/;

if (!apiSource.includes('https://doorstep-mobile.onrender.com')) {
  throw new Error('Production API URL is missing from frontend/src/api.ts');
}

if (!envExample.includes('VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com')) {
  throw new Error('frontend/.env.example must document the production API URL');
}

if (localhostPattern.test(apiSource)) {
  throw new Error('Production frontend API client must not reference localhost');
}

console.log('Frontend production configuration is valid.');

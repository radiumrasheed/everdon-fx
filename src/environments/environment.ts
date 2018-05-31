// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:8000/api',
  PUSHER_KEY: '4cf14d87b9e0479cdd88',
  PUSHER_CLUSTER: 'eu',
  // API_URL: 'http://192.168.0.101:8000/api'
};

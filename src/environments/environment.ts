// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
	production: false,
	API_URL: 'http://localhost:8000/api',
	PUSHER_KEY: 'e4064c606d37d415e34b',
	PUSHER_CLUSTER: 'eu',
	CLOUDINARY_CLOUD_NAME: 'sparklegrid'
	// API_URL: 'http://192.168.0.101:8000/api'
};

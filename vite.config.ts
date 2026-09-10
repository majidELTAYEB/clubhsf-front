// import { sentrySvelteKit } from '@sentry/sveltekit';
// import tailwindcss from '@tailwindcss/vite';
// import adapter from '@sveltejs/adapter-node';
// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';

// export default defineConfig({
// 	plugins: [
// 		sentrySvelteKit({
// 			org: 'majido',
// 			project: 'javascript-sveltekit'
// 		}),
// 		tailwindcss(),
// 		sveltekit({
// 			compilerOptions: {
// 				runes: ({ filename }) =>
// 					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
// 			},
// 			adapter: adapter()
// 		}),
// 	],
// });


import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sentrySvelteKit({
            org: 'majido',
            project: 'javascript-sveltekit'
        }),
        tailwindcss(),
        sveltekit(),
    ],
});
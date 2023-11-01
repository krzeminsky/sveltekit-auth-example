// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	namespace Lucia {
		type Auth = import("./src/lib/server/auth/lucia.ts").Auth;
		type DatabaseUserAttributes = {
			email: string
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};

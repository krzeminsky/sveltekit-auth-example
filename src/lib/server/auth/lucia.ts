import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import { lucia } from "lucia";
import { database } from "../db/database";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { google } from "@lucia-auth/oauth/providers"; 
import { env } from "$env/dynamic/private";

export const auth = lucia({
    adapter: betterSqlite3(database, {
        user: "user",
        key: "user_key",
        session: "user_session"
    }),

    env: dev ? "DEV" : "PROD",
    
    middleware: sveltekit(),

	getUserAttributes: (data) => {
		return {
			email: data.email
		};
	}
})
 
export const googleAuth = google(auth, {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
    scope: [
        "https://www.googleapis.com/auth/userinfo.email"
    ]
});

export type Auth = typeof auth;
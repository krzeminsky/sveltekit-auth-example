import { auth } from '$lib/server/auth/lucia.js';
import { updateTokens } from '$lib/server/db/redis.js';

export const load = (async (event) => {
    if (!updateTokens(event.getClientAddress())) return;
    
    const session = await auth.handleRequest(event).validate();
    if (session) return { user: session.user }
});
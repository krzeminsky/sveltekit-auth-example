import { auth } from '$lib/server/auth/lucia.js';
import { createAndSendVerificationCode, getVerificationCode, updateTokens } from '$lib/server/db/redis.js'
import { AuthError } from '$lib/validation/auth-error.js'
import { fail, redirect } from '@sveltejs/kit'

export const actions = {
    default: async (event) => {
        if (!await updateTokens(event.getClientAddress())) return fail(400, { error: AuthError.RateLimitReached });

        const formData = await event.request.formData();
        
        const code = formData.get('code');
        const email = event.url.searchParams.get('email');

        if (!code || !email) return fail(400, { error: AuthError.Unknown });

        const verificationCode = await getVerificationCode(email);

        if (!verificationCode) return fail(400, { error: AuthError.CodeExpired });
        else if (verificationCode.c != code) return fail(400, { error: AuthError.WrongCode });

        try {
            // TODO: implement account creation when google oauth is done

            // * test for scenario where user tries to link email|password to an existing account made with google

            /*
            const key = await auth.useKey("email", parsedData.data.email, code.p);
            const session = await auth.createSession({ userId: key.userId, attributes: { } });

            auth.handleRequest(event).setSession(session);
            */

            throw Error;
        } catch {
            return fail(400, { error: AuthError.Unknown });
        }

        throw redirect(302, `/${event.url.searchParams.get('returnTo')??'profile'}`);
    }
}
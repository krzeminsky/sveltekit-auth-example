import { auth } from '$lib/server/auth/lucia.js';
import { getUserIdByEmail } from '$lib/server/db/database.js';
import { deleteCode, getVerificationCode, updateTokens } from '$lib/server/db/redis.js'
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
            const userId = getUserIdByEmail(email);

            if (!userId) { // ? No account exists
                await auth.createUser({
                    key: {
                        providerId: "email",
                        providerUserId: email,
                        password: verificationCode.p
                    },

                    attributes: { 
                        email
                    }
                });
            } else {
                await auth.createKey({
                    userId,
                    providerId: "email",
                    providerUserId: email,
                    password: verificationCode.p
                });
            }

            const key = await auth.useKey("email", email, verificationCode.p);
            const session = await auth.createSession({ userId: key.userId, attributes: { } });

            auth.handleRequest(event).setSession(session);

            await deleteCode(email);
        } catch (e) {
            return fail(400, { error: AuthError.Unknown });
        }

        throw redirect(302, `/${event.url.searchParams.get('returnTo')??'account'}`);
    }
}
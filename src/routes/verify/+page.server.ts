import { auth } from '$lib/server/auth/lucia.js';
import { createAndSendVerificationCode, getVerificationCode, updateTokens } from '$lib/server/db/redis.js'
import { AuthError } from '$lib/validation/auth-error.js'
import { formSchema, verificationSchema } from '$lib/validation/schema.js';
import { fail, redirect } from '@sveltejs/kit'

export const actions = {
    default: async (event) => {
        if (!await updateTokens(event.getClientAddress())) return fail(400, { error: AuthError.RateLimitReached });

        // ? maybe instead of passing email through the form, we can already use the email in the url search params
        const parsedData = verificationSchema.safeParse(Object.fromEntries(await event.request.formData()));

        if (!parsedData.success) return fail(400, { error: AuthError.Unknown });

        const code = await getVerificationCode(parsedData.data.email);

        if (!code) return fail(400, { error: AuthError.CodeExpired });
        else if (code.c != parsedData.data.code) return fail(400, { error: AuthError.WrongCode });

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
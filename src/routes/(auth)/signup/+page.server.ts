import { auth } from '$lib/server/auth/lucia.js';
import { createAndSendVerificationCode, getVerificationCode, updateTokens } from '$lib/server/db/redis.js'
import { AuthError } from '$lib/validation/auth-error.js'
import { formSchema } from '$lib/validation/schema.js';
import { fail, redirect } from '@sveltejs/kit'

export const actions = {
    default: async (event) => {
        if (!await updateTokens(event.getClientAddress())) return fail(400, { error: AuthError.RateLimitReached });

        const parsedData = formSchema.safeParse(Object.fromEntries(await event.request.formData()));

        // ? since we already do client side validation, this error will be returned only when user uses a script and purposely sends invalid data
        if (!parsedData.success) return fail(400, { error: AuthError.Unknown });
    
        try {
            // ? if the user doesn't exists, it will throw an error and then we can continue with the signup
            await auth.getKey("email", parsedData.data.email);

            return fail(400, { error: AuthError.EmailInUse });
        } catch {
            const code = await getVerificationCode(parsedData.data.email);
            
            // ? why not just update the password or redirect the user to the verification screen?
            // ? lets say that 2 people tried to create an account with the same email, but only User A has access to the email
            // ? User A starts the verification process, in the meantime, User B creates an account and updates the password for User A verification process
            // ? User A then tries to log in after successful sign up, but can't because User B changed the password
            if (code) return fail(400, { error: AuthError.EmailInUse });
            else await createAndSendVerificationCode(parsedData.data.email, parsedData.data.password);

            throw redirect(302, `/verify?returnTo=${event.url.searchParams.get('returnTo')??'account'}&email=${parsedData.data.email}`);
        }
    }
}
import { auth, googleAuth } from '$lib/server/auth/lucia.js';

export const GET = async (event) => {
    const storedState = event.cookies.get('google_oauth_state');
    const state = event.url.searchParams.get('state');
    const code = event.url.searchParams.get('code');

    if (!storedState || !state || storedState !== state || !code) {
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(code);

        const getUser = async () => {
            const existingUser = await getExistingUser();

            if (existingUser) return existingUser;

            const user = await createUser({
                attributes: {
                    email: googleUser.email!
                }
            });

            return user;
        }

        const user = await getUser();
        const session = await auth.createSession({
            userId: user.userId,
            attributes: {}
        });

        auth.handleRequest(event).setSession(session);

        return new Response(null, {
            status: 302,
            headers: {
                Location: "/account"
            }
        });
    } catch (e) {
        console.log(e);
        return new Response(null, { status: 400 });
    }
}
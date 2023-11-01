<script lang="ts">
    import { AuthError } from "$lib/validation/auth-error";

    export let error: AuthError = AuthError.None;

    $: errorMessage = getErrorMessage(error);

    function getErrorMessage(e: AuthError) {
        switch (e) {
            case AuthError.None: return "";
            case AuthError.Unknown: return "Something went wrong!";
            case AuthError.EmailInUse: return "This email is already in use!";
            case AuthError.CredentialsMismatch: return "Email and password don't match!";
            case AuthError.WrongCode: return "Invalid code!";
            case AuthError.CodeExpired: return "This verification has expired!";
            case AuthError.RateLimitReached: return "You're making too many requests! Slow down.";
        }
    }
</script>

<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
    <slot />

    <small class="text-red-500 text-center">{errorMessage}</small>
</div>
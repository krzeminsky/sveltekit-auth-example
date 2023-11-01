<script lang="ts">
    import { enhance } from "$app/forms";
    import { AuthError } from "$lib/validation/auth-error";
    import FormWrapper from "./form-wrapper.svelte";
    import SubmitButton from "./submit-button.svelte";

    export let onSubmit: (data: FormData, cancel: () => void) => void;

    let error: AuthError = AuthError.None;
    let awaitingResponse = false;

    // ? svelte inline typescript is stupid 
    function setError(e: unknown) { error = e as AuthError; } 
</script>

<FormWrapper {error}>
    <form method="post" use:enhance={({ formData, cancel }) => {
        awaitingResponse = true;

        onSubmit(formData, () => { cancel(); awaitingResponse = false; })

        return async ({ update, result }) => {
            await update({ reset: false });

            if (result.type === "failure" && result.data) setError(result.data.error);
        }
    }}>
        <slot />
        
        <SubmitButton />
    </form>
</FormWrapper>
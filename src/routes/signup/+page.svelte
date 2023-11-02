<script lang="ts">
    import AuthForm from "$lib/components/form/auth-form.svelte";
    import PasswordInput from "$lib/components/form/password-input.svelte";
    import TextInput from "$lib/components/form/text-input.svelte";
    import { formSchema } from "$lib/validation/schema";

    let emailError = false;
    let passwordError = false;
    let confirmError = false;

    let awaitingResponse = false;
</script>

<AuthForm bind:awaitingResponse onSubmit={(data, cancel) => {
    emailError = false;
    passwordError = false;
    
    const parseResult = formSchema.safeParse(Object.fromEntries(data));

    confirmError = data.get('password') == data.get('confirmPassword');

    if (!parseResult.success) {
        const error = parseResult.error.flatten();

        emailError = !error.fieldErrors.email;
        passwordError = !error.fieldErrors.password;

        cancel();
    } else if (confirmError) cancel();
}}>
    <TextInput name="email" label="Email" placeholder="example@mymail.com" invalid={emailError} disabled={awaitingResponse} />

    <PasswordInput description="Must contain at least 8 characters and 1 number" invalid={passwordError} disabled={awaitingResponse} />

    <TextInput name="confirmPassword" label="Confirm password" placeholder="Confirm password" type="password" invalid={confirmError} disabled={awaitingResponse} />
</AuthForm>
<script lang="ts">
    import { enhance } from "$app/forms";
    import FormWrapper from "$lib/components/form/form-wrapper.svelte";
    import SubmitButton from "$lib/components/form/submit-button.svelte";
    import { AuthError } from "$lib/validation/auth-error";

    let error: AuthError = AuthError.None;
    let fields: HTMLInputElement[] = [];

    let currentField = 0;
    let awaitingResponse = false;
    let disabled = true;

    
    function focusCurrent() { fields[currentField].focus(); }
    function blurCurrent() { fields[currentField].blur(); }
    function clearCurrent() { fields[currentField].value = ""; }

    function enterDigit(e: KeyboardEvent) {
        if (e.key == "Delete" || e.key == "Backspace") {
            e.preventDefault();
            disabled = true;

            if (currentField > 0 && fields[currentField].value == "") {
                currentField--;

                clearCurrent();
                focusCurrent();
            } else clearCurrent();
        } else if (!isNaN(Number(e.key))) {
            e.preventDefault();
            
            fields[currentField].value = e.key;

            if (currentField < fields.length - 1) {
                currentField++;

                focusCurrent();
            } else {
                blurCurrent();
                disabled = false;
            }
        } else if (!e.ctrlKey && e.key != "V") e.preventDefault();
    }

    function pasteCode(e: ClipboardEvent) {
        if (e.clipboardData) {
            const text = e.clipboardData.getData("text");
            if (!text) return;

            const code = text.substring(0, 6);
            for (let i = 0; i < code.length; i++) fields[i].value = code[i];
            for (let i = code.length; i < 6; i++) fields[i].value = "";

            currentField = code.length - 1;
            fields[currentField].focus();
        }
    }

    function setError(e: unknown) {
        error = e as AuthError;
    }
</script>

<FormWrapper {error}>
    <h1 class="h-14 text-center text-5xl bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-500">Verify your account</h1>
    <h2 class="text-center text-lg">A code has been sent to your email adress. Enter it below.</h2>

    <form method="post" class="w-fit flex flex-col items-center gap-8" use:enhance={({ formData, cancel }) => {
        awaitingResponse = true;

        const code = fields.map(f => f.value).join('');

        if (code.length != 6 || isNaN(Number(code))) cancel();
        else formData.set('code', code);

        return async ({ update, result }) => {
            await update({ reset: false });

            if (result.type === "failure" && result.data) {
                setError(result.data.error);
            }

            awaitingResponse = false;
        }
    }}>
        <div class="code flex gap-2">
            {#each {length: 6} as _, i}
            <!--Sometimes browsers ignore autocomplete="off" so setting invalid value will prevent this-->
            <!-- svelte-ignore a11y-autocomplete-valid -->
            <input 
                type="text" 
                pattern="[0-9]*" 
                maxlength="1" 
                autocomplete="nope" 
                required 
                bind:this={fields[i]}
                on:focus={focusCurrent}
                on:paste={pasteCode} 
                on:keydown={enterDigit}
            />
            {/each}
        </div>

        <SubmitButton {disabled} {awaitingResponse} />
    </form>
</FormWrapper>

<style lang="postcss">
    .code input {
        @apply border-2 w-12 h-16 rounded-xl text-center text-2xl transition-all outline-none focus:border-gray-400
    }
</style>

<script lang="ts" context="module">
  import type {FormApi, Suite} from "@vonagam/svelte-vest";
  import {useForm, Field, Form} from "@vonagam/svelte-vest";

  type State = {
    username?: string,
  };

  const suite: Suite.Body<State> = (_state, test) => {
    test("username", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be at least 4 symbols long.").longerThanOrEquals(4);
      enforce("Must be at most 20 symbols long.").shorterThanOrEquals(20);
      enforce("Must contain only letters, numbers, hyphens and underscores.").matches(/^[a-z0-9_-]*$/i);
    });
  };
</script>

<script lang="ts">
  const action: FormApi.Action<State> = async (form) => {
    if (!form.isValid()) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  useForm({suite, action});
</script>

<Field field="username" let:field>
  <input
    type="text"
    value={field.value || ""}
    disabled={field.locked}
    on:input={field.onInput}
    on:change={field.onChange}
    on:blur={field.onBlur}
  />

  {#if field.visited || field.form.submitted}
    <div>{field.message}</div>
  {/if}
</Field>

<Form let:form>
  {@const disabled = form.locked || form.omitted}

  <button disabled={disabled} on:click={form.onSubmit}>
    {#if form.submitting}
      Submitting...
    {:else}
      Submit
    {/if}
  </button>
</Form>

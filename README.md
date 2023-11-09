# @vonagam/svelte-vest

[![Repository](https://img.shields.io/badge/github-vonagam%2Fsvelte-vest)](https://github.com/vonagam/svelte-vest)
[![Package Version](https://img.shields.io/npm/v/%40vonagam/svelte-vest)](https://www.npmjs.com/package/@vonagam/svelte-vest)
[![License](https://img.shields.io/npm/l/%40vonagam%2Fsvelte-vest)](https://github.com/vonagam/svelte-vest/blob/master/LICENSE.md)

Helpers for using Vest with Svelte.

## Installation

```
npm install --save-dev @vonagam/svelte-vest
yarn add --dev @vonagam/svelte-vest
pnpm add --save-dev @vonagam/svelte-vest
```

## Usage

```svelte
<script lang="ts" context="module">
  import type {FormApi, Suite} from "@vonagam/svelte-vest";
  import {useForm, Field, Form} from "@vonagam/svelte-vest";

  // Define form state type.
  // (In this example it is a simple object, but it also can be one with nesting if `access` option is used.)
  type State = {
    username?: string,
  };

  // Define Vest suite body.
  // An argument object contains `values` (form state) and `test` (helper for writing tests).
  // Usage of `test` is optional, all usual Vest methods do work.
  const suite: Suite.Body<State> = ({test}) => {
    test("username", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be at least 4 symbols long.").longerThanOrEquals(4);
      enforce("Must be at most 20 symbols long.").shorterThanOrEquals(20);
      enforce("Must contain only letters, numbers, hyphens and underscores.").matches(/^[a-z0-9_-]*$/i);
    });
  };
</script>

<script lang="ts">
  // Define how submit is handled.
  // The only argument is a `FormApi` instance.
  const action: FormApi.Action<State> = async (form) => {
    // The action will be called after everything is tested.

    // It will be called even when a form is not considered valid.
    // Most likely you would want to skip such case.
    if (!form.isValid()) return;

    // Do your valid form submission handling here...
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Initialize the form.
  // Returns created `FormApi`.
  // Also sets it into context for it to be accessible with `useContextForm`.
  useForm({suite, action});
</script>

<!-- Access a field with `VestField`, provides `FieldWrap` through `field` -->
<VestField field="username" let:field>
  <!-- Accessing properties with stores will return a value and create a subscription for rerendering. -->
  <!-- In this example, `value`, `locked`, `visited`, `message` and `subbmitted` on `form` do that. -->
  <input
    type="text"
    value={field.value}
    disabled={field.locked}
    on:input={field.onInput}
    on:change={field.onChange}
    on:blur={field.onBlur}
  />

  <!-- Shows an error message, but only if a field has been visited or a form has been submitted already. -->
  {#if field.visited || field.form.submitted}
    <div>{field.message}</div>
  {/if}
</VestField>

<!-- Access a form with `VestForm`, provides `FormWrap` through `field` -->
<VestForm let:form>
  <!-- `@const` can be handy in `VestForm`/`VestField` -->
  {@const disabled = form.locked || form.omitted}

  <button disabled={disabled} on:click={form.onSubmit}>
    {#if form.submitting}
      Submitting...
    {:else}
      Submit
    {/if}
  </button>
</VestForm>
```

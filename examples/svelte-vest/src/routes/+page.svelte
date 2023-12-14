<script lang="ts" context="module">
  import "vest/enforce/email";
  import * as Vest from "vest";
  import type {FormApi, Suite} from "@vonagam/svelte-vest";
  import {useForm, useSubmit, Field, Form} from "@vonagam/svelte-vest";

  type State = {
    username?: boolean,
    email?: boolean,
    password?: boolean,
    password_confirmation?: boolean,
  };

  const suite: Suite.Body<State> = ({values, test}) => {
    Vest.include("password_confirmation").when("password");

    test("username", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be at least 4 symbols long.").longerThanOrEquals(4);
      enforce("Must be at most 20 symbols long.").shorterThanOrEquals(20);
      enforce("Must contain only letters, numbers, hyphens and underscores.").matches(/^[a-z0-9_-]*$/i);
    });

    test("email", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be a valid email address.").isEmail();
    });

    test("password", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be at least 8 symbols long.").longerThanOrEquals(8);
    });

    test("password_confirmation", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must match the password.").equals(values.password);
    });
  };
</script>

<script lang="ts">
  const action: FormApi.Action<State> = async (form) => {
    if (!form.isValid()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return Math.random() > 0.25;
  };

  const form = useForm({suite, action});
  const submit = useSubmit(form);
</script>

<h1>Form</h1>

<Field field="username" let:field>
  <div>
    <label>
      <b>Username:</b> <br/>
      <input
        type="text"
        value={field.value || ""}
        disabled={field.locked}
        on:input={field.onInput}
        on:change={field.onChange}
        on:blur={field.onBlur}
      />
    </label>

    {#if field.visited || field.form.submitted}
      <div>{field.message}</div>
    {/if}
  </div>
</Field> <br/>

<Field field="email" let:field>
  <div>
    <label>
      <b>Email:</b> <br/>
      <input
        type="email"
        value={field.value || ""}
        disabled={field.locked}
        on:input={field.onInput}
        on:change={field.onChange}
        on:blur={field.onBlur}
      />
    </label>

    {#if field.visited || field.form.submitted}
      <div>{field.message}</div>
    {/if}
  </div>
</Field> <br/>

<Field field="password" let:field>
  <div>
    <label>
      <b>Password:</b> <br/>
      <input
        type="password"
        value={field.value || ""}
        disabled={field.locked}
        on:input={field.onInput}
        on:change={field.onChange}
        on:blur={field.onBlur}
      />
    </label>

    {#if field.visited || field.form.submitted}
      <div>{field.message}</div>
    {/if}
  </div>
</Field> <br/>

<Field field="password_confirmation" let:field>
  <div>
    <label>
      <b>Password confirmation:</b> <br/>
      <input
        type="password"
        value={field.value || ""}
        disabled={field.locked}
        on:input={field.onInput}
        on:change={field.onChange}
        on:blur={field.onBlur}
      />
    </label>

    {#if field.visited || field.form.submitted}
      <div>{field.message}</div>
    {/if}
  </div>
</Field> <br/>

<Form let:form>
  {@const disabled = form.locked || form.omitted || $submit.status !== undefined}

  <div>
    <button disabled={disabled} on:click={submit.handle}>
      {#if $submit.status === "pending"}
        Submitting...
      {:else if $submit.status === "done" && $submit.result === true}
        Success :)
      {:else if $submit.status === "done"}
        Error :(
      {:else}
        Submit
      {/if}
    </button>
  </div>
</Form>

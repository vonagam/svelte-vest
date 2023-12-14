<script lang="ts" context="module">
  import "./styles.js";
  import "vest/enforce/email";
  import * as Vest from "vest";
  import Button from "flowbite-svelte/Button.svelte";
  import Card from "flowbite-svelte/Card.svelte";
  import Heading from "flowbite-svelte/Heading.svelte";
  import Spinner from "flowbite-svelte/Spinner.svelte";
  import {useForm, useSubmit, Form, FormApi, Suite} from "@vonagam/svelte-vest";
  import {FieldTag, FieldName, FieldInput, FieldMessage} from "@vonagam/svelte-vest-flowbite";

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
    if (!form.isValid()) return false;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  };

  const form = useForm({suite, action});
  const submit = useSubmit(form);
</script>

<Card class="mx-auto my-8 gap-4">
  <Heading>Form</Heading>

  <div class="flex flex-col gap-2">
    <FieldTag field="username" class="flex flex-col gap-1" let:field>
      <FieldName {field} tag="label" for="username">Username:</FieldName>
      <FieldInput {field} id="username" />
      <FieldMessage {field} />
    </FieldTag>

    <FieldTag field="email" class="flex flex-col gap-1" let:field>
      <FieldName {field} tag="label" for="email">Email:</FieldName>
      <FieldInput {field} id="email" type="email" />
      <FieldMessage {field} />
    </FieldTag>

    <FieldTag field="password" class="flex flex-col gap-1" let:field>
      <FieldName {field} tag="label" for="password">Password:</FieldName>
      <FieldInput {field} id="password" type="password" />
      <FieldMessage {field} />
    </FieldTag>

    <FieldTag field="password_confirmation" class="flex flex-col gap-1" let:field>
      <FieldName {field} tag="label" for="password_confirmation">Password confirmation:</FieldName>
      <FieldInput {field} id="password_confirmation" type="password" />
      <FieldMessage {field} />
    </FieldTag>
  </div>

  <Form let:form>
    {@const disabled = form.locked || form.omitted || $submit.status !== undefined}

    <div>
      <Button class="flex gap-3 px-4" disabled={disabled} on:click={submit.handle}>
        {#if $submit.status === "pending"}
          <Spinner class="w-5 h-5" /> Submitting...
        {:else if $submit.status === "done" && $submit.result === true}
          <div class="w-5 h-5">:)</div> Success
        {:else if $submit.status === "done"}
          <div class="w-5 h-5">:(</div> Error
        {:else}
          <div class="w-5 h-5">▶</div> Submit
        {/if}
      </Button>
    </div>
  </Form>
</Card>

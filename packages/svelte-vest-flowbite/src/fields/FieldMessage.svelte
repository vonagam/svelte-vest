<script lang="ts" context="module">
  import {Field, FieldApi, FieldWrap} from "@vonagam/svelte-vest";
  import Message from "../inputs/Message.svelte";
</script>

<script lang="ts">
  export let field: string | FieldApi | FieldWrap;
</script>

<Field {field} let:field>
  <Message
    {...$$restProps}
    color={field.invalid ? "red" : "base"}
    disabled={field.locked}
  >
    {#if field.visited || field.form.submitted}
      {field.message}
    {/if}
  </Message>
</Field>

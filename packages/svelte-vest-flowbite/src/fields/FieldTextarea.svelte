<script lang="ts" context="module">
  import {Field, FieldApi, FieldWrap} from "@vonagam/svelte-vest";
  import Textarea from "../inputs/Textarea.svelte";
  import {getFieldColor} from "./common.js";
</script>

<script lang="ts">
  export let field: string | FieldApi | FieldWrap;
</script>

<Field {field} let:field>
  <Textarea
    {...$$restProps}
    value={field.value}
    color={getFieldColor(field)}
    disabled={field.locked}
    on:input={field.onInput}
    on:change={field.onChange}
    on:blur={field.onBlur}
  />
</Field>

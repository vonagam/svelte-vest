<script lang="ts" context="module">
  import {Field, FieldApi, FieldWrap} from "@vonagam/svelte-vest";
  import Name from "../inputs/Name.svelte";
  import {getFieldColor} from "./common.js";
</script>

<script lang="ts">
  export let field: string | FieldApi | FieldWrap;
</script>

<Field {field} let:field>
  <Name
    {...$$restProps}
    color={getFieldColor(field)}
    disabled={field.locked}
  >
    <slot {field} />
  </Name>
</Field>

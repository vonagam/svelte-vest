<script lang="ts" context="module">
  import {Field, FieldApi, FieldWrap} from "@vonagam/svelte-vest";
</script>

<script lang="ts">
  export let field: string | FieldApi | FieldWrap;
  export let tag: string = "div";
</script>

<Field {field} let:field>
  <svelte:element this={tag} {...$$restProps}>
    <slot {field} />
  </svelte:element>
</Field>

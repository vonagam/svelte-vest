<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import type {FormApi} from "../api/FormApi.js";
  import type {FieldApi} from "../api/FieldApi.js";
  import {useContextForm} from "../api/useForm.js";
  import {FormWrap} from "./FormWrap.js";
  import {FieldWrap} from "./FieldWrap.js";
</script>

<script lang="ts">
  let formProp: FormApi | FormWrap | undefined = undefined;
  let fieldProp: FieldApi | FieldWrap | string;
  export {formProp as form};
  export {fieldProp as field};

  if (typeof fieldProp === "string") {
    formProp = (formProp instanceof FormWrap) ? formProp.formApi : formProp || useContextForm();
    fieldProp = formProp.field(fieldProp);
  } else {
    fieldProp = (fieldProp instanceof FieldWrap) ? fieldProp.fieldApi : fieldProp;
  }

  let field = new FieldWrap(fieldProp, [], () => { field = field });

  onDestroy(field._unsubscribe);
</script>

<slot {field} />

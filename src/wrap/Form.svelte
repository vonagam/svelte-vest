<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import type {FormApi} from "../api/FormApi.js";
  import {useContextForm} from "../api/useForm.js";
  import {FormWrap} from "./FormWrap.js";
</script>

<script lang="ts">
  let formProp: FormApi | FormWrap | undefined = undefined;
  export {formProp as form};

  formProp = (formProp instanceof FormWrap) ? formProp.formApi : formProp || useContextForm();
  let form = new FormWrap(formProp, [], () => { form = form });

  onDestroy(form._unsubscribe);
</script>

<slot {form} />

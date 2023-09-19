<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import {FormApi} from "../api/FormApi.js";
  import {useContextForm} from "../api/useForm.js";
  import {FormWrap} from "./FormWrap.js";
</script>

<script lang="ts">
  let formApi: FormApi | undefined = undefined;
  export {formApi as form};

  formApi ||= useContextForm();
  let form = new FormWrap(formApi, [], () => { form = form });

  onDestroy(form._unsubscribe);
</script>

<slot {form} />

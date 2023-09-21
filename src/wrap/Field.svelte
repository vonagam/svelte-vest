<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import {FormApi} from "../api/FormApi.js";
  import {FieldApi} from "../api/FieldApi.js";
  import {useContextForm} from "../api/useForm.js";
  import {FieldWrap} from "./FieldWrap.js";
</script>

<script lang="ts">
  let formApi: FormApi | undefined = undefined;
  let fieldApi: FieldApi | string;
  export {formApi as form};
  export {fieldApi as field};

  if (typeof fieldApi === "string") {
    formApi ||= useContextForm();
    fieldApi = formApi.field(fieldApi);
  }

  let field = new FieldWrap(fieldApi, [], () => { field = field });

  onDestroy(field._unsubscribe);
</script>

<slot {field} />

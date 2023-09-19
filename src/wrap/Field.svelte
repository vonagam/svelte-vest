<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import {FormApi} from "../api/FormApi.js";
  import {FieldApi} from "../api/FieldApi.js";
  import {useContextForm} from "../api/useForm.js";
  import {FieldWrap} from "./FieldWrap.js";
</script>

<script lang="ts">
  let formApi: FormApi | undefined = undefined;
  let fieldApi: FieldApi | undefined = undefined;
  let name: string | undefined = undefined;
  export {formApi as form};
  export {fieldApi as field};
  export {name};

  if (!fieldApi) {
    formApi ||= useContextForm();
    fieldApi = formApi.field(name!);
  }

  let field = new FieldWrap(fieldApi, [], () => { field = field });

  onDestroy(field._unsubscribe);
</script>

<slot {field} />

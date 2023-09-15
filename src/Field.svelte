<script lang="ts" context="module">
  import {onDestroy} from "svelte";
  import {FormApi} from "./FormApi.js";
  import {FieldApi} from "./FieldApi.js";
  import {useContextForm} from "./useForm.js";

  export type Stored = {
    readonly summary: FieldApi.Summary | undefined,
    readonly value: any,
    readonly disabled: boolean,
    readonly readonly: boolean,
    readonly locked: boolean,
    readonly touched: boolean,
    readonly blurred: boolean,
    readonly valid: boolean,
    readonly invalid: boolean,
    readonly tested: boolean,
    readonly untested: boolean,
    readonly pending: boolean,
    readonly warned: boolean,
    readonly uncertain: boolean,
    readonly omitted: boolean,
    readonly error: string,
    readonly errors: string[],
    readonly warning: string,
    readonly warnings: string[],
    readonly message: string,
    readonly messages: string[],
  };

  const storesKeys = new Set<keyof Stored>([
    "summary",
    "value",
    "disabled",
    "readonly",
    "locked",
    "touched",
    "blurred",
    "valid",
    "invalid",
    "tested",
    "untested",
    "pending",
    "warned",
    "uncertain",
    "omitted",
    "error",
    "errors",
    "warning",
    "warnings",
    "message",
    "messages",
  ]);

  const isStoreKey = (key: string): key is keyof Stored => {
    return storesKeys.has(key as keyof Stored);
  }

  export interface F<T, F, K> extends Stored {}
  export interface F<T, F, K> extends Omit<FieldApi<T, F, K>, keyof Stored> {}

  export class F<T = any, F extends string = keyof T & string, K extends F = F> {
    readonly form: FormApi<T, F>;
    readonly field: FieldApi<T, F, K>;
    readonly name: K;

    _unsubscribes?: (() => void)[];
    _invalidate: () => void;

    constructor(field: FieldApi<T, F, K>, invalidate: () => void) {
      this.form = field.form;
      this.field = field;
      this.name = field.name;
      this._invalidate = invalidate;
    }
  }

  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(FieldApi.prototype))) {
    if (!descriptor.get) continue;

    if (isStoreKey(name)) {
      Object.defineProperty(F.prototype, name, {configurable: true, get(this: F) {
        Object.defineProperty(this, name, {configurable: true, writable: true, value: undefined});

        const invalidate = this._invalidate;
        this._unsubscribes ||= [];
        this._unsubscribes.push(this.field[name].subscribe((value) => {
          this[name as never] = value as never;
          invalidate();
        }));

        return this[name];
      }});
    } else {
      Object.defineProperty(F.prototype, name, {configurable: true, get() {
        const got = this.field[name];
        Object.defineProperty(this, name, {configurable: true, value: got});
        return got;
      }});
    }
  }
</script>

<script lang="ts">
  export let form: FormApi | undefined = undefined;
  export let name: string;

  form ||= useContextForm();

  let f = new F(form.field(name), () => { f = f });

  onDestroy(() => {
    if (f._unsubscribes) {
      for (const unsubscribe of f._unsubscribes) {
        unsubscribe();
      }
    }
  });
</script>

<slot {f} />

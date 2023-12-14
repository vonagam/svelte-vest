# @vonagam/svelte-vest

[![Repository](https://img.shields.io/badge/github-vonagam%2Fsvelte--vest-green)](https://github.com/vonagam/svelte-vest)
[![Package Version](https://img.shields.io/npm/v/%40vonagam/svelte-vest)](https://www.npmjs.com/package/@vonagam/svelte-vest)
[![License](https://img.shields.io/npm/l/%40vonagam%2Fsvelte-vest)](https://github.com/vonagam/svelte-vest/blob/master/LICENSE.md)

Helpers for using [Vest](https://vestjs.dev/) (version 5) with [Svelte](https://svelte.dev/) (version 4): 
Access Vest's form state through Svelte's context, components and stores.

The library tries to be unopinionated and concern itself only with exposing Vest. So just like with Vest
visual representation of forms is completely up to you. Though if you need one there is
[svelte-vest-flowbite](./packages/svelte-vest-flowbite/) which provides inputs compatible with Flowbite.
It can be used as a reference point for library usage.

Basic examples of usage for `svelte-vest` and `svelte-vest-flowbite` can be found in [examples](./examples/) folder.

## Installation

```
npm install --save-dev @vonagam/svelte-vest
yarn add --dev @vonagam/svelte-vest
pnpm add --save-dev @vonagam/svelte-vest
```

## Usage

```svelte
<script lang="ts" context="module">
  import type {FormApi, Suite} from "@vonagam/svelte-vest";
  import {useForm, Field, Form} from "@vonagam/svelte-vest";

  // Define form state type.
  // (In this example it is a simple object, but it also can be one with nesting if `access` option is used.)
  type State = {
    username?: string,
  };

  // Define Vest suite body.
  // An argument object contains `values` (form state) and `test` (helper for writing tests).
  // Usage of `test` is optional, all usual Vest methods do work.
  const suite: Suite.Body<State> = ({test}) => {
    test("username", ({enforce}) => {
      enforce("Must be specified.").isString().isNotBlank();
      enforce("Must be at least 4 symbols long.").longerThanOrEquals(4);
      enforce("Must be at most 20 symbols long.").shorterThanOrEquals(20);
      enforce("Must contain only letters, numbers, hyphens and underscores.").matches(/^[a-z0-9_-]*$/i);
    });
  };
</script>

<script lang="ts">
  // Define how submit is handled.
  // The only argument is a `FormApi` instance.
  const action: FormApi.Action<State> = async (form) => {
    // The action will be called after everything is tested.

    // It will be called even when a form is not considered valid.
    // Most likely you would want to skip such case.
    if (!form.isValid()) return;

    // Do your valid form submission handling here...
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Initialize the form.
  // Returns created `FormApi`.
  // Also sets it into context for it to be accessible with `useContextForm`.
  useForm({suite, action});
</script>

<!-- Access a field with `VestField`, provides `FieldWrap` through `field` -->
<VestField field="username" let:field>
  <!-- Accessing properties with stores will return a value and create a subscription for rerendering. -->
  <!-- In this example, `value`, `locked`, `visited`, `message` and `subbmitted` on `form` do that. -->
  <input
    type="text"
    value={field.value}
    disabled={field.locked}
    on:input={field.onInput}
    on:change={field.onChange}
    on:blur={field.onBlur}
  />

  <!-- Shows an error message, but only if a field has been visited or a form has been submitted already. -->
  {#if field.visited || field.form.submitted}
    <div>{field.message}</div>
  {/if}
</VestField>

<!-- Access a form with `VestForm`, provides `FormWrap` through `field` -->
<VestForm let:form>
  <!-- `@const` can be handy in `VestForm`/`VestField` -->
  {@const disabled = form.locked || form.omitted}

  <button disabled={disabled} on:click={form.onSubmit}>
    {#if form.submitting}
      Submitting...
    {:else}
      Submit
    {/if}
  </button>
</VestForm>
```

## Api

Entry point:

- [`useForm(options)`](#useform)

Imperative API, to be used in event handlers and such:

- [`FormApi`](#formapi)
- [`FieldApi`](#fieldapi)

Declarative API, Svelte components for usage in templates:

- [`Form`](#form)
- [`Field`](#field)

Additional utils:

- [`useContextForm()`](#usecontextform)

### useForm

The main function. Creates [`FormApi`](#formapi) and adds it to context.
It is expected to be called during Svelte component mount.
Otherwise setting context will not work (and in such case `options.context` should be set to false).

```ts
function useForm<V = any, A = V>(options: useForm.Options<V, A>): FormApi<V, A>

namespace useForm {
  type Options<V = any, A = V> = {
    // The only required option, Vest suite function.
    suite: Suite.Body<V, A>,
    // Initial values if any. By default it is an empty object.
    values?: V,
    // How to work (get/set/remove) with fields. Described bellow. If you need deep values object.
    access?: Access<V, A>,
    // How to find an input element which corresponds to a field.
    selector?: ((field: Access.Field<A>) => HTMLElement | null | undefined) | string,
    // What happens on submit after validation. By default nothing. Gets called even if the form is invalid.
    action?: (form: FormApi<V, A>) => any,
    // Already touched fields (the user did some input).
    touched?: Iterable<Access.Field<A>>,
    // Already visited fields (they received focus and then lost it).
    visited?: Iterable<Access.Field<A>>,
    // Set to false to skip setting Svelte context.
    context?: boolean,
  }
}

namespace Suite {
  // Vest suite body, receives input object and defines Vest tests.
  type Body<V = any, A = V> = (input: Input<V, A>) => void;

  type Input<V = any, A = V> = {
    // Form values object.
    values: V,
    // A helper function for adding tests. Described bellow. Usage is optional.
    test: Test<V, A>,
  };
}

// A helper for adding a test to a suite. Is called with a field name and a test function.
type Test<V = any, A = V> = <F extends Access.Field<A>>(field: F, test: Test.Body<A[F]>) => void;

namespace Test {
  // Get input and throw to fail a test.
  type Body<T = any> = (input: Input<T>) => void | Promise<void>;
  
  type Input<T = any> = {
    // A field value.
    value: T,
    // Helper around Vest enforce function. Give a fail message and receive an enforce to test.
    enforce: (message: string) => ReturnType<typeof Vest["enforce"]>,
    // React to async test cancellation.
    signal: AbortSignal,
  };
}

// A way to customize how to work with values object.
type Access<V = any, A = V> = {
  // Get a field value from values object. By default it is `values[field]`.
  get: <F extends Field<A>>(values: V, field: F) => A[F],
  // Set a field value. By default is is `{...values, [field]: value}`.
  set: <F extends Field<A>>(values: V, field: F, value: A[F]) => V,
  // Remove a field. By default it is doing `delete result[field]`.
  remove: <F extends Field<A>>(values: V, field: F) => V,
  // Update a field using updater. By default is is `set(values, field, updater(get(values, field))))`.
  update?: <F extends Field<A>>(values: V, field: F, updater: (value: A[F]) => A[F]) => V,
}

namespace Access {
  // Just a key of access object. By default access object type is the same as values object type.
  type Field<A = any> = keyof A & string;
}
```

### FormApi

The main entity around which everything is built.

Svelte stores use getters because most of them are lazy defined. Meaning that they won't be created unless accessed.

```ts
class FormApi<V = any, A = V> {
  // Form itself. Can be handy when used with destructuring.
  readonly form: FormApi<V, A>

  // Resets everything (options, values, suite).
  resetApi(options: FormApi.Options<V, A>): void

  // -- Summary --

  // Get Vest suite summary.
  getSummary(): Vest.SuiteResult<Access.Field<A>, string>
  get summary(): Store.Readable<Vest.SuiteResult<Access.Field<A>, string>>

  // Get Vest field summary.
  getFieldSummary(field: Access.Field<A>): Vest.SingleTestSummary

  // -- Tests --

  // Run tests for a single, multiple or all fields.
  test(only?: Access.Field<A> | Access.Field<A>[]): Vest.SuiteRunResult<Access.Field<A>, string>

  // Same as `test`.
  testField(field: Access.Field<A>): Vest.SuiteRunResult<Access.Field<A>, string>

  // -- Values --

  // Set form values.
  setValues(values: V): void

  // Update form values.
  updateValues(updater: (values: V) => V): void

  // Get form values.
  getValues(): V
  get values(): Store.Readable<V>

  // Set a field value.
  setFieldValue<F extends Access.Field<A>>(field: F, value: A[F]): void

  // Update a field value.
  updateFieldValue<F extends Access.Field<A>>(field: F, updater: Access.Updater<V, A, F>): void

  // Remove a field value from form values.
  removeFieldValue(field: Access.Field<A>): void

  // Get a field value.
  getFieldValue<F extends Access.Field<A>>(field: F): A[F]

  // -- Locks --

  // Locking does not actuall prevent values modifications from happening.
  // It is up to modificating code to check if a field is locked.
  // Like default event handlers provided bellow do.

  // Lock form values. Returns an unlock function.
  lock(): () => void

  // Check if form values can be modified.
  isLocked(): boolean
  get locked(): Store.Readable<boolean>

  // Lock a field. Returns an unlock function.
  lockField(field: Access.Field<A>): () => void

  // Check if a field value can be modified.
  isFieldLocked(field: Access.Field<A>): boolean

  // List of fields that have been individually locked.
  get lockedFields(): Store.Readable<Set<Access.Field<A>>>

  // -- Submit --

  // Do submit - lock the form, mark it as submitting, run all tests and then call `action`.
  submit(action: (form: FormApi<V, A>) => any = this.action!): Promise<any>

  // Check if the form is currently submitting.
  isSubmitting(): boolean
  get submitting(): Store.Readable<boolean>

  // Check if the form has attempted submitting at least once.
  isSubmitted(): boolean
  get submitted(): Store.Readable<boolean>

  // -- Touched / Visited --

  // Touched = was modified at some point (even if it was reverted later).
  // Visited = was focused at some point.

  // Check if any field was touched.
  isTouched(): boolean
  get touched(): Store.Readable<boolean>

  // Mark a field as touched (or untocuhed).
  setFieldTouched(field: Access.Field<A>, bool?: boolean): void

  // Check if a field was touched.
  isFieldTouched(field: Access.Field<A>): boolean

  // Touched fields in a store.
  get touchedFields(): Store.Writable<Set<Access.Field<A>>>

  // Check if any field was visited.
  isVisited(): boolean
  get visited(): Store.Readable<boolean>

  // Mark a field as visited (or unvisited).
  setFieldVisited(field: Access.Field<A>, bool?: boolean): void
  
  // Check if a field was visited.
  isFieldVisited(field: Access.Field<A>): boolean

  // Visited fields in a store.
  get visitedFields(): Store.Writable<Set<Access.Field<A>>>

  // -- Event handlers --

  // The only subjective part of the api. 
  // The usage is completely optional.

  // Calls submit.
  onSubmit(event: any): void

  // If a field is not locked then change its value, mark it as touched, run its tests if it was visited.
  onFieldInput(field: Access.Field<A>, event: any): void

  // If a field it not locked then change its value, mark it as touched and visited, run its tests.
  onFieldChange(field: Access.Field<A>, event: any): void

  // If a field is not loccked then mark it as visited and run its tests if it was touched.
  onFieldBlur(field: Access.Field<A>, event: any): void

  // -- Input elements --

  // Those methods need `selector` option to work.
  // Otherwise they would do nothing.

  // Find an input element which corresponds to a field.
  findFieldInput(field: Access.Field<A>): HTMLElement | undefined

  // Focus an input element which corresponds to a field.
  focusFieldInput(field: Access.Field<A>): void

  // Blur an input element which corresponds to a field.
  blurFieldInput(field: Access.Field<A>): void

  // -- Summary states --

  // Definitions for states:
  // valid = all non optional fields have executed tests and no errors.
  // invalid = has some errors.
  // tested = has some executed tests.
  // untested = has no executed tests.
  // pending = has some unfinished executing tests.
  // warned = has some warnings.
  // uncertain = not valid, but no errors either.
  // omitted = valid without tests.

  isValid(): boolean
  isInvalid(): boolean
  isTested(): boolean
  isUntested(): boolean
  isPending(): boolean
  isWarned(): boolean
  isUncertain(): boolean
  isOmitted(): boolean

  get valid(): Store.Readable<boolean>
  get invalid(): Store.Readable<boolean>
  get tested(): Store.Readable<boolean>
  get untested(): Store.Readable<boolean>
  get pending(): Store.Readable<boolean>
  get warned(): Store.Readable<boolean>
  get uncertain(): Store.Readable<boolean>
  get omitted(): Store.Readable<boolean>
  
  isFieldValid(field: Access.Field<A>): boolean
  isFieldInvalid(field: Access.Field<A>): boolean
  isFieldTested(field: Access.Field<A>): boolean
  isFieldUntested(field: Access.Field<A>): boolean
  isFieldPending(field: Access.Field<A>): boolean
  isFieldWarned(field: Access.Field<A>): boolean
  isFieldUncertain(field: Access.Field<A>): boolean
  isFieldOmitted(field: Access.Field<A>): boolean

  // -- Summary messages --

  getError(): Suite.Failure<V, A> | undefined
  getErrors(): Vest.FailureMessages
  getWarning(): Suite.Failure<V, A> | undefined
  getWarnings(): Vest.FailureMessages

  get error(): Store.Readable<Suite.Failure<V, A> | undefined>
  get errors(): Store.Readable<FailureMessages>
  get warning(): Store.Readable<Suite.Failure<V, A> | undefined>
  get warnings(): Store.Readable<FailureMessages>

  getFieldError(field: Access.Field<A>): string
  getFieldErrors(field: Access.Field<A>): string[]
  getFieldWarning(field: Access.Field<A>): string
  getFieldWarnings(field: Access.Field<A>): string[]

  // -- Field apis --

  // Get FieldApi for a field. Multiple calls return the same instance.
  field<F extends Access.Field<A>>(field: F): FieldApi<V, A, F>
}
```

### FieldApi

`FieldApi` is just a wrapper around [`FormApi`](#formapi) for a specific field.

```ts
class FieldApi<V = any, A = V, F extends Access.Field<A> = Access.Field<A>> {
  readonly form: FormApi<V, A>
  readonly field: FieldApi<V, A, F>
  readonly name: F

  // -- Summary --
  getSummary(): Vest.SingleTestSummary
  get summary(): Store.Readable<Vest.SingleTestSummary>

  // -- Tests --
  test(): Vest.SuiteRunResult<Access.Field<A>, string>

  // -- Values --
  setValue(value: A[F]): void
  updateValue(updater: Access.Updater<V, A, F>): void
  removeValue(): void
  getValue(): A[F]
  get value(): Store.Writable<A[F]>

  // -- Locks --
  lock(): () => void
  isLocked(): boolean
  get locked(): Store.Readable<boolean>

  // -- Touched / Visited --
  setTouched(bool?: boolean): void
  isTouched(): boolean
  get touched(): Store.Writable<boolean>
  setVisited(bool?: boolean): void
  isVisited(): boolean
  get visited(): Store.Writable<boolean>

  // -- Event handlers --
  onInput(event: any): void
  onChange(event: any): void
  onBlur(event: any): void

  // -- Input elements --
  findInput(): HTMLElement | undefined
  focusInput(): void
  blurInput(): void

  // -- Summary states --
  isValid(): boolean
  isInvalid(): boolean
  isTested(): boolean
  isUntested(): boolean
  isPending(): boolean
  isWarned(): boolean
  isUncertain(): boolean
  isOmitted(): boolean
  get valid(): Store.Readable<boolean>
  get invalid(): Store.Readable<boolean>
  get tested(): Store.Readable<boolean>
  get untested(): Store.Readable<boolean>
  get pending(): Store.Readable<boolean>
  get warned(): Store.Readable<boolean>
  get uncertain(): Store.Readable<boolean>
  get omitted(): Store.Readable<boolean>

  // -- Summary messages --
  getError(): string
  getErrors(): string[]
  getWarning(): string
  getWarnings(): string[]
  get error(): Store.Readable<string>
  get errors(): Store.Readable<string[]>
  get warning(): Store.Readable<string>
  get warnings(): Store.Readable<string[]>
  get message(): Store.Readable<string>
  get messages(): Store.Readable<string[]>
}
```

### Form

The component for using form api in template.

```ts
type Props = {
  // If the prop is undefined, a form is taken from context.
  form?: FormApi | FormWrap | undefined,
}

type Let = {
  // `FormWrap` is the same as `FormApi` but all properties with stores return their values instead.
  form: FormWrap,
}
```

```svelte
<Form let:form>
  <!-- `form.valid` will return boolean and subscribe to form validity changes -->
  Form is valid: {form.valid}
</Form>
```

### Field

The component for using field api in template.

```ts
type Props = {
  // If the prop is undefined, a form is taken from context.
  form?: FormApi | FormWrap | undefined,

  // Required. Specifies the field which will be exposed.
  field: FieldApi | FieldWrap | string,
}

type Let = {
  // `FieldWrap` is the same as `FieldApi` but all properties with stores return their values instead.
  field: FieldWrap,
}
```

```svelte
<Field field="name" let:field>
  <!-- `field.valid` will return boolean and subscribe to field validity changes -->
  Field is valid: {field.valid}
</Field>
```

### useContextForm

By default [`useForm`](#useform) adds a created [`FormApi`](#formapi) to Svelte context. 
This a way to get it from context.

```ts
function useContextForm<V = any, A = V>(): FormApi<V, A>
```

## Links

- [Vest](https://vestjs.dev/)
- [Svelte](https://svelte.dev/)

# @vonagam/svelte-vest-flowbite

[![Repository](https://img.shields.io/badge/github-vonagam%2Fsvelte--vest-green)](https://github.com/vonagam/svelte-vest/tree/master/packages/svelte-vest-flowbite)
[![Package Version](https://img.shields.io/npm/v/%40vonagam/svelte-vest-flowbite)](https://www.npmjs.com/package/@vonagam/svelte-vest-flowbite)
[![License](https://img.shields.io/npm/l/%40vonagam%2Fsvelte-vest)](https://github.com/vonagam/svelte-vest/blob/master/LICENSE.md)

Provides UI components in style of [Flowbite](https://flowbite.com/) for `@vonagam/svelte-vest`.

## Installation

```
npm install --save-dev @vonagam/svelte-vest-flowbite
yarn add --dev @vonagam/svelte-vest-flowbite
pnpm add --save-dev @vonagam/svelte-vest-flowbite
```

## Usage

Usage example can be found in [`examples/svelte-vest-flowbite`](../../examples/svelte-vest-flowbite/src/routes/+page.svelte).

## Api

All exported components have two variants - controlled and uncontrolled. Uncontrolled variant (like `Checkbox`) implements an UI component in Flowbite style. Controlled variant (like `FieldCheckbox`) is a wrapper around
uncontrolled version with some props being set based on a field state.

All controlled variants have an additional required prop `field` of type `string | FieldApi | FieldWrap` 
to specify which field the component works with.

Components:
- [Checkbox](#checkbox)
- [Input](#input)
- [Message](#message)
- [Name](#name)
- [Radio](#radio)
- [Select](#select)
- [Textarea](#textarea)

### Checkbox

`Checkbox` represents a single checkbox input element (without a label).

```ts
// In addition to all input element props.
type Props = {
  // Values of checked checkboxes in a group. Default: an empty array.
  group?: (string | number)[],
  // Value corresponding to this checkbox. Default: "on".
  value?: string | number,
  // Checked status of checkbox. Default: undefined and then becomes boolean based on `group` and `value`.
  checked?: boolean | undefined,
  // Adds "sr-only peer" class if true. Default: false.
  custom?: boolean,
  // Color. Default: "base".
  color?: "base" | "green" | "red",
}
```

`FieldCheckbox` variant controls `checked`, `color` and `disabled`.

### Input

`Input` represents a single input element.

```ts
// In addition to all input element props.
type Props = {
  // A type prop for an input element. Default: "text".
  type?: string,
  // Value. Default: undefined.
  value?: string | undefined,
  // Size. Default: "md".
  size?: "sm" | "md" | "lg",
  // Color. Default: "base".
  color?: "base" | "green" | "red",
}
```

`FieldInput` variant controls `value`, `color` and `disabled`.

### Message

`Message` represents a message (error/warning/details) for an input.

```ts
// In addition to all element props.
type Props = {
  // Element tag to use. Default: "p".
  tag?: string,
  // Size. Default: "md".
  size?: "sm" | "md" | "lg",
  // Color. Default: "base".
  color?: "base" | "green" | "red",
  // Adds "opacity-50" if true. Default: false.
  disabled?: boolean,
}
```

`FieldMessage` variant controls `color` and `disabled`.

### Name

`Name` represents a name for an input, usually inside a label.

```ts
// In addition to all element props.
type Props = {
  // Element tag to use. Default: "span".
  tag?: string,
  // Size. Default: "md".
  size?: "sm" | "md" | "lg",
  // Color. Default: "base".
  color?: "base" | "green" | "red",
  // Adds "opacity-50" if true. Default: false.
  disabled?: boolean,
}
```

`FieldName` variant controls `color` and `disabled`.

### Radio

`Radio` represents a single radio input element (without a label).

```ts
// In addition to all input element props.
type Props = {
  // Value of a checked radio in a group. Default: "".
  group?: string | number,
  // Value corresponding to this radio. Default: "".
  value?: string | number,
  // Adds "sr-only peer" class if true. Default: false.
  custom?: boolean,
  // Color. Default: "base".
  color?: "base" | "green" | "red",
}
```

`FieldRadio` variant controls `group`, `color` and `disabled`.

### Select

`Select` represents a select element.

```ts
// In addition to all select element props.
type Props = {
  // Options. If an empty array then default slot can be used for rendering custom options. Default: [].
  items?: {value: any, name: any}[],
  // Adds `<option disabled selected value="">{placeholder}</option>` if not undefined. Default: undefined.
  placeholder?: string | undefined,
  // Selected value. Default: undefined.
  value?: string | undefined,
  // Size. Default: "md".
  size?: "sm" | "md" | "lg",
  // Color. Default: "base".
  color?: "base" | "green" | "red",
}
```

`FieldSelect` variant controls `value`, `color` and `disabled`.

### Textarea

`Textarea` represents a textarea element.

```ts
// In addition to all textarea element props.
type Props = {
  // Value. Default: undefined.
  value?: string | undefined,
  // Size. Default: "md".
  size?: "sm" | "md" | "lg",
  // Color. Default: "base".
  color?: "base" | "green" | "red",
}
```

`FieldTextarea` variant controls `value`, `color` and `disabled`.

## Links

- [Flowbite](https://flowbite.com/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Vest](https://vestjs.dev/)
- [Svelte](https://svelte.dev/)

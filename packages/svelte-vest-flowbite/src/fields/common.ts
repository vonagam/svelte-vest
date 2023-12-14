import {type FieldWrap} from "@vonagam/svelte-vest";

export const getFieldColor = (field: FieldWrap) => {
  if (field.valid && !field.omitted) return "green";
  if (field.invalid) return "red";
  return "base";
};

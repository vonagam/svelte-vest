import * as Store from "svelte/store";
import {vestSelectors} from './utils/vestSelectors.js';
import {lazyPrototype} from './utils/lazyPrototype.js';
import {Access} from "./Access.js";
import {Suite} from "./Suite.js";
import {FieldApi} from "./FieldApi.js";

export declare namespace FormApi {
  type Options<T = any, F extends string = keyof T & string> = {
    suite: Suite.Body<T, F>,

    values?: T,
    access?: Access<T, F>,

    findInput?: ((field: F) => HTMLElement | null | undefined) | string,

    disabled?: boolean,
    readonly?: boolean,

    disabledFields?: Iterable<F>,
    readonlyFields?: Iterable<F>,
    touchedFields?: Iterable<F>,
    blurredFields?: Iterable<F>,
  };
}

export class FormApi<T = any, F extends string = keyof T & string> {
  readonly form: FormApi<T, F>;

  private suite!: Suite<T, F>;
  private find!: (field: F) => HTMLElement | null | undefined;
  private get!: Access.Get<T, F>;
  private set!: Access.Set<T, F>;
  private remove!: Access.Remove<T, F>;
  private update!: Access.Update<T, F>;
  private fields?: {[K in F]: FieldApi<T, F, K>};
  private resultStore: ValueStore<Suite.Result<T, F>>;
  private valuesStore: ValueStore<T>;
  private isDisabledStore?: ValueStore<boolean>;
  private isReadonlyStore?: ValueStore<boolean>;
  private disabledStore?: SetStore<F>;
  private readonlyStore?: SetStore<F>;
  private touchedStore?: SetStore<F>;
  private blurredStore?: SetStore<F>;

  // setup

  constructor(options: FormApi.Options<T, F>) {
    this.form = this;
    this.resultStore = makeValueStore<Suite.Result<T, F>>();
    this.valuesStore = makeValueStore<T>();
    this.resetApi(options);
  }

  resetApi(options: FormApi.Options<T, F>) {
    const {get, set, remove, update} = options.access || Access as any as Access<T, F>;
    this.get = get;
    this.set = set;
    this.remove = remove;
    this.update = update || (((values, field, updater) => set(values, field, updater(get(values, field)))));

    this.suite?.reset();
    this.suite = Suite(options.suite, get);
    this.resultStore.set(this.suite.get());

    this.valuesStore.set(options.values || {} as T);

    const findInput = options.findInput || (() => undefined);
    this.find = typeof findInput === 'string'
      ? ((field) => document.querySelector<HTMLElement>(findInput.replace(/\{\}/g, field)))
      : findInput;

    if (this.isDisabledStore || options.disabled) {
      this.isDisabledStore ||= makeValueStore();
      this.isDisabledStore.set(!!options.disabled);
    }
    if (this.isReadonlyStore || options.readonly) {
      this.isReadonlyStore ||= makeValueStore();
      this.isReadonlyStore.set(!!options.readonly);
    }

    if (this.disabledStore || options.disabledFields) {
      this.disabledStore ||= makeValueStore();
      this.disabledStore.set(new Set(options.disabledFields));
    }
    if (this.readonlyStore || options.readonlyFields) {
      this.readonlyStore ||= makeValueStore();
      this.readonlyStore.set(new Set(options.readonlyFields));
    }
    if (this.touchedStore || options.touchedFields) {
      this.touchedStore ||= makeValueStore();
      this.touchedStore.set(new Set(options.touchedFields));
    }
    if (this.blurredStore || options.blurredFields) {
      this.blurredStore ||= makeValueStore();
      this.blurredStore.set(new Set(options.blurredFields));
    }
  }

  // summary

  getSummary() {
    return this.resultStore.value;
  }

  get summary() {
    return Store.readonly(this.resultStore);
  }

  getFieldSummary(field: F) {
    return this.resultStore.value.tests[field];
  }

  // tests

  test(only?: F | F[]) {
    const result = this.suite(this.valuesStore.value, only);
    let sync = false;

    result.done((result) => {
      sync = true;
      this.resultStore.set(result);
    });

    if (!sync) {
      this.resultStore.set(result);
    }

    return result;
  }

  testField(field: F) {
    return this.test(field);
  }

  // form values

  setValues(values: T) {
    this.valuesStore.set(values);
  }

  updateValues(updater: (values: T) => T) {
    this.valuesStore.update(updater);
  }

  getValues() {
    return this.valuesStore.value;
  }

  get values() {
    return Store.readonly(this.valuesStore);
  }

  setFieldValue<K extends F>(field: K, value: Access.Value<T, K>) {
    this.valuesStore.set(this.set(this.valuesStore.value, field, value));
  }

  updateFieldValue<K extends F>(field: K, updater: Access.Updater<T, K>) {
    this.valuesStore.set(this.update(this.valuesStore.value, field, updater as any));
  }

  removeFieldValue(field: F) {
    this.valuesStore.set(this.remove(this.valuesStore.value, field));
  }

  getFieldValue(field: F) {
    return this.get(this.valuesStore.value, field);
  }

  // disabled

  setDisabled(bool?: boolean) {
    this.isDisabledStore ||= makeValueStore();
    this.isDisabledStore.set(bool ?? true);
  }

  isDisabled() {
    return !!this.isDisabledStore?.value;
  }

  get disabled(): Store.Writable<boolean> {
    return this.isDisabledStore ||= makeValueStore(false);
  }

  setFieldDisabled(field: F, bool?: boolean) {
    toggleSetStore(this.disabledStore ||= makeSetStore(), field, bool ?? true);
  }

  isFieldDisabled(field: F) {
    return !!this.isDisabledStore?.value || !!this.disabledStore?.value.has(field);
  }

  get disabledFields() {
    return Store.readonly(this.disabledStore ||= makeSetStore());
  }

  // reaodnly

  setReadonly(bool?: boolean) {
    this.isReadonlyStore ||= makeValueStore();
    this.isReadonlyStore.set(bool ?? true);
  }

  isReadonly() {
    return !!this.isReadonlyStore?.value;
  }

  get readonly(): Store.Writable<boolean> {
    return this.isReadonlyStore ||= makeValueStore(false);
  }

  setFieldReadonly(field: F, bool?: boolean) {
    toggleSetStore(this.readonlyStore ||= makeSetStore(), field, bool ?? true);
  }

  isFieldReadonly(field: F) {
    return !!this.isReadonlyStore?.value || !!this.readonlyStore?.value.has(field);
  }

  get readonlyFields() {
    return Store.readonly(this.readonlyStore ||= makeSetStore());
  }

  // locked

  isLocked() {
    return !this.isDisabled() && !this.isReadonly();
  }

  get locked() {
    return Store.derived([this.disabled, this.readonly], ([disabled, readonly]) => disabled || readonly);
  }

  isFieldLocked(field: F) {
    return !this.isFieldDisabled(field) && !this.isFieldReadonly(field);
  }

  // mark interactions

  setFieldTouched(field: F, bool?: boolean) {
    this.touchedStore ||= makeSetStore();
    toggleSetStore(this.touchedStore, field, bool ?? true);
  }

  setFieldBlurred(field: F, bool?: boolean) {
    this.blurredStore ||= makeSetStore();
    toggleSetStore(this.blurredStore, field, bool ?? true);
  }

  // events callbacks

  onFieldBlur(field: F) {
    if (!this.isFieldLocked(field)) return;
    this.setFieldBlurred(field, true);
    if (!this.isFieldTested(field) && this.isFieldTouched(field)) this.testField(field);
  }

  onFieldInput(field: F, event: any) {
    if (!this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    if (this.isFieldTested(field) && next !== prev) this.testField(field);
  }

  onFieldChange(field: F, event: any) {
    if (!this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    this.setFieldBlurred(field, true);
    if (!this.isFieldTested(field) || next !== prev) this.testField(field);
  }

  // field input

  findFieldInput(field: F) {
    return this.find(field) || undefined;
  }

  focusFieldInput(field: F) {
    this.find(field)?.focus();
  }

  blurFieldInput(field: F) {
    this.find(field)?.blur();
  }

  // interaction states

  isTouched() {
    return !!this.touchedStore?.value.size;
  }
  isFieldTouched(field: F) {
    return !!this.touchedStore?.value.has(field);
  }
  isBlurred() {
    return !!this.blurredStore?.value.size;
  }
  isFieldBlurred(field: F) {
    return !!this.blurredStore?.value.has(field);
  }
  get touchedFields(): Store.Writable<Set<F>> {
    return this.touchedStore ||= makeSetStore();
  }
  get blurredFields(): Store.Writable<Set<F>> {
    return this.blurredStore ||= makeSetStore();
  }
  get touched() {
    return Store.derived(this.touchedFields, (set) => set.size > 0);
  }
  get blurred() {
    return Store.derived(this.blurredFields, (set) => set.size > 0);
  }

  // result states

  isValid() {
    return vestSelectors.valid(this.resultStore.value);
  }
  isInvalid() {
    return vestSelectors.invalid(this.resultStore.value);
  }
  isTested() {
    return vestSelectors.tested(this.resultStore.value);
  }
  isUntested() {
    return vestSelectors.untested(this.resultStore.value);
  }
  isWarned() {
    return vestSelectors.warned(this.resultStore.value);
  }
  isUncertain() {
    return vestSelectors.uncertain(this.resultStore.value);
  }
  isPending() {
    return vestSelectors.pending(this.resultStore.value);
  }
  get valid() {
    return Store.derived(this.resultStore, vestSelectors.valid);
  }
  get invalid() {
    return Store.derived(this.resultStore, vestSelectors.invalid);
  }
  get tested() {
    return Store.derived(this.resultStore, vestSelectors.tested);
  }
  get untested() {
    return Store.derived(this.resultStore, vestSelectors.untested);
  }
  get pending() {
    return Store.derived(this.resultStore, vestSelectors.pending);
  }
  get warned() {
    return Store.derived(this.resultStore, vestSelectors.warned);
  }
  get uncertain() {
    return Store.derived(this.resultStore, vestSelectors.uncertain);
  }
  isFieldValid(field: F) {
    return vestSelectors.valid(this.resultStore.value.tests[field]);
  }
  isFieldInvalid(field: F) {
    return vestSelectors.invalid(this.resultStore.value.tests[field]);
  }
  isFieldTested(field: F) {
    return vestSelectors.tested(this.resultStore.value.tests[field]);
  }
  isFieldUntested(field: F) {
    return vestSelectors.untested(this.resultStore.value.tests[field]);
  }
  isFieldPending(field: F) {
    return vestSelectors.pending(this.resultStore.value.tests[field]);
  }
  isFieldWarned(field: F) {
    return vestSelectors.warned(this.resultStore.value.tests[field]);
  }
  isFieldUncertain(field: F) {
    return vestSelectors.uncertain(this.resultStore.value.tests[field]);
  }
  isFieldOmitted(field: F) {
    return vestSelectors.omitted(this.resultStore.value.tests[field]);
  }

  // result messages

  getError() {
    return this.resultStore.value.getError();
  }
  getErrors() {
    return this.resultStore.value.getErrors();
  }
  getWarning() {
    return this.resultStore.value.getWarning();
  }
  getWarnings() {
    return this.resultStore.value.getWarnings();
  }
  get error() {
    return Store.derived(this.resultStore, (r) => r.getError() || "");
  }
  get errors() {
    return Store.derived(this.resultStore, (r) => r.getErrors());
  }
  get warning() {
    return Store.derived(this.resultStore, (r) => r.getWarning() || "");
  }
  get warnings() {
    return Store.derived(this.resultStore, (r) => r.getWarnings());
  }
  getFieldError(field: F) {
    return this.resultStore.value.getError(field) || "";
  }
  getFieldErrors(field: F) {
    return this.resultStore.value.getErrors(field);
  }
  getFieldWarning(field: F) {
    return this.resultStore.value.getWarning(field) || "";
  }
  getFieldWarnings(field: F) {
    return this.resultStore.value.getWarnings(field);
  }

  // field api

  field<K extends F>(field: K): FieldApi<T, F, K> {
    return (this.fields ||= Object.create(null))[field] ||= new FieldApi(this, field);
  }
}

// laziness

lazyPrototype(FormApi.prototype);

// FieldApi partials

const partialRegexp = /Field(?=$|[A-Z])/;

for (const name of Object.getOwnPropertyNames(FormApi.prototype)) {
  const partial = name.replace(partialRegexp, "");
  if (partial === name) continue;
  Object.defineProperty(FieldApi.prototype, partial, {configurable: true, get() {
    const bind = this.form[name].bind(this.form, this.name);
    Object.defineProperty(this.field, partial, {configurable: true, value: bind});
    return bind;
  }});
}

// ValueStore

type ValueStore<T> = Store.Writable<T> & {value: T};

const makeValueStore = <T>(value?: T) => {
  const {subscribe, set: doSet} = Store.writable(value);

  const set = (value: T) => {
    if (value === store.value) return;
    store.value = value;
    doSet(value);
  };

  const update = (updater: (value: T) => T) => {
    const value = updater(store.value);
    if (value === store.value) return;
    store.value = value;
    doSet(value);
  };

  const store = {value, set, update, subscribe} as ValueStore<T>;

  return store;
};

// SetStore

type SetStore<T> = ValueStore<Set<T>>;

const makeSetStore = <T>() => {
  return makeValueStore(new Set<T>());
};

const toggleSetStore = <T>(store: SetStore<T>, item: T, next: boolean) => {
  store.update((set) => {
    const prev = set.has(item);
    if (next === prev) return set;
    set = new Set(set);
    next ? set.add(item) : set.delete(item);
    return set;
  });
};

import * as Store from "svelte/store";
import {vestSelectors} from './utils/vestSelectors.js';
import {lazyPrototype} from './utils/lazyPrototype.js';
import {Access} from "./Access.js";
import {Suite} from "./Suite.js";
import {FieldApi} from "./FieldApi.js";

export declare namespace FormApi {
  type Options<V = any, A = V> = {
    suite: Suite.Body<V, A>,
    access?: Access<V, A>,
    findInput?: ((field: Access.Field<A>) => HTMLElement | null | undefined) | string,

    values?: V,
    disabled?: boolean,
    disabledFields?: Iterable<Access.Field<A>>,
    touchedFields?: Iterable<Access.Field<A>>,
    blurredFields?: Iterable<Access.Field<A>>,
  };
}

export class FormApi<V = any, A = V> {
  readonly form: FormApi<V, A>;

  private suite!: Suite<V, A>;
  private find!: (field: Access.Field<A>) => HTMLElement | null | undefined;
  private get!: Access.Get<V, A>;
  private set!: Access.Set<V, A>;
  private remove!: Access.Remove<V, A>;
  private update!: Access.Update<V, A>;
  private fields?: {[F in Access.Field<A>]: FieldApi<V, A, F>};
  private resultStore: ValueStore<Suite.Result<V, A>>;
  private valuesStore: ValueStore<V>;
  private isDisabledStore?: ValueStore<boolean>;
  private disabledStore?: SetStore<Access.Field<A>>;
  private touchedStore?: SetStore<Access.Field<A>>;
  private blurredStore?: SetStore<Access.Field<A>>;

  // setup

  constructor(options: FormApi.Options<V, A>) {
    this.form = this;
    this.resultStore = makeValueStore<Suite.Result<V, A>>();
    this.valuesStore = makeValueStore<V>();
    this.resetApi(options);
  }

  resetApi(options: FormApi.Options<V, A>) {
    const {get, set, remove, update} = options.access || Access as any as Access<V, A>;
    this.get = get;
    this.set = set;
    this.remove = remove;
    this.update = update || (((values, field, updater) => set(values, field, updater(get(values, field)))));

    this.suite?.reset();
    this.suite = Suite(options.suite, get);
    this.resultStore.set(this.suite.get());

    this.valuesStore.set(options.values || {} as V);

    const findInput = options.findInput || (() => undefined);
    this.find = typeof findInput === 'string'
      ? ((field) => document.querySelector<HTMLElement>(findInput.replace(/\{\}/g, field)))
      : findInput;

    if (this.isDisabledStore || options.disabled) {
      this.isDisabledStore ||= makeValueStore();
      this.isDisabledStore.set(!!options.disabled);
    }

    if (this.disabledStore || options.disabledFields) {
      this.disabledStore ||= makeValueStore();
      this.disabledStore.set(new Set(options.disabledFields));
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

  getFieldSummary(field: Access.Field<A>) {
    return this.resultStore.value.tests[field];
  }

  // tests

  test(only?: Access.Field<A> | Access.Field<A>[]) {
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

  testField(field: Access.Field<A>) {
    return this.test(field);
  }

  // form values

  setValues(values: V) {
    this.valuesStore.set(values);
  }

  updateValues(updater: (values: V) => V) {
    this.valuesStore.update(updater);
  }

  getValues() {
    return this.valuesStore.value;
  }

  get values() {
    return Store.readonly(this.valuesStore);
  }

  setFieldValue<F extends Access.Field<A>>(field: F, value: A[F]) {
    this.valuesStore.set(this.set(this.valuesStore.value, field, value));
  }

  updateFieldValue<F extends Access.Field<A>>(field: F, updater: Access.Updater<V, A, F>) {
    this.valuesStore.set(this.update(this.valuesStore.value, field, updater as any));
  }

  removeFieldValue(field: Access.Field<A>) {
    this.valuesStore.set(this.remove(this.valuesStore.value, field));
  }

  getFieldValue(field: Access.Field<A>) {
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

  setFieldDisabled(field: Access.Field<A>, bool?: boolean) {
    toggleSetStore(this.disabledStore ||= makeSetStore(), field, bool ?? true);
  }

  isFieldDisabled(field: Access.Field<A>) {
    return !!this.isDisabledStore?.value || !!this.disabledStore?.value.has(field);
  }

  get disabledFields() {
    return Store.readonly(this.disabledStore ||= makeSetStore());
  }

  // mark interactions

  setFieldTouched(field: Access.Field<A>, bool?: boolean) {
    toggleSetStore(this.touchedStore ||= makeSetStore(), field, bool ?? true);
  }

  setFieldBlurred(field: Access.Field<A>, bool?: boolean) {
    toggleSetStore(this.blurredStore ||= makeSetStore(), field, bool ?? true);
  }

  // events callbacks

  onFieldBlur(field: Access.Field<A>) {
    if (!this.isFieldDisabled(field)) return;
    this.setFieldBlurred(field, true);
    if (!this.isFieldTested(field) && this.isFieldTouched(field)) this.testField(field);
  }

  onFieldInput(field: Access.Field<A>, event: any) {
    if (!this.isFieldDisabled(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    if (this.isFieldTested(field) && next !== prev) this.testField(field);
  }

  onFieldChange(field: Access.Field<A>, event: any) {
    if (!this.isFieldDisabled(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    this.setFieldBlurred(field, true);
    if (!this.isFieldTested(field) || next !== prev) this.testField(field);
  }

  // field input

  findFieldInput(field: Access.Field<A>) {
    return this.find(field) || undefined;
  }

  focusFieldInput(field: Access.Field<A>) {
    this.find(field)?.focus();
  }

  blurFieldInput(field: Access.Field<A>) {
    this.find(field)?.blur();
  }

  // interaction states

  isTouched() {
    return !!this.touchedStore?.value.size;
  }
  isFieldTouched(field: Access.Field<A>) {
    return !!this.touchedStore?.value.has(field);
  }
  isBlurred() {
    return !!this.blurredStore?.value.size;
  }
  isFieldBlurred(field: Access.Field<A>) {
    return !!this.blurredStore?.value.has(field);
  }
  get touchedFields(): Store.Writable<Set<Access.Field<A>>> {
    return this.touchedStore ||= makeSetStore();
  }
  get blurredFields(): Store.Writable<Set<Access.Field<A>>> {
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
  isFieldValid(field: Access.Field<A>) {
    return vestSelectors.valid(this.resultStore.value.tests[field]);
  }
  isFieldInvalid(field: Access.Field<A>) {
    return vestSelectors.invalid(this.resultStore.value.tests[field]);
  }
  isFieldTested(field: Access.Field<A>) {
    return vestSelectors.tested(this.resultStore.value.tests[field]);
  }
  isFieldUntested(field: Access.Field<A>) {
    return vestSelectors.untested(this.resultStore.value.tests[field]);
  }
  isFieldPending(field: Access.Field<A>) {
    return vestSelectors.pending(this.resultStore.value.tests[field]);
  }
  isFieldWarned(field: Access.Field<A>) {
    return vestSelectors.warned(this.resultStore.value.tests[field]);
  }
  isFieldUncertain(field: Access.Field<A>) {
    return vestSelectors.uncertain(this.resultStore.value.tests[field]);
  }
  isFieldOmitted(field: Access.Field<A>) {
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
  getFieldError(field: Access.Field<A>) {
    return this.resultStore.value.getError(field) || "";
  }
  getFieldErrors(field: Access.Field<A>) {
    return this.resultStore.value.getErrors(field);
  }
  getFieldWarning(field: Access.Field<A>) {
    return this.resultStore.value.getWarning(field) || "";
  }
  getFieldWarnings(field: Access.Field<A>) {
    return this.resultStore.value.getWarnings(field);
  }

  // field api

  field<F extends Access.Field<A>>(field: F): FieldApi<V, A, F> {
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

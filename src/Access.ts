export declare namespace Access {
  type Key<I = any> = keyof I & string;
  type Get<T = any, I = T> = <F extends Key<I>>(values: T, field: F) => I[F];
  type Set<T = any, I = T> = <F extends Key<I>>(values: T, field: F, value: I[F]) => T;
  type Remove<T = any, I = T> = <F extends Key<I>>(values: T, field: F) => T;
  type Updater<T = any, I = T, F extends Key<I> = Key<I>> = (value: I[F]) => I[F];
  type Update<T = any, I = T> = <F extends Key<I>>(values: T, field: F, updater: Updater<T, I, F>) => T;
}

export type Access<T = any, I = T> = {
  get: Access.Get<T, I>,
  set: Access.Set<T, I>,
  remove: Access.Remove<T, I>,
  update?: Access.Update<T, I>,
};

export const Access: Access = {
  get: (values, field) => {
    return values[field];
  },
  set: (values, field, value) => {
    if (value === values[field]) return values;
    const result = {...values};
    result[field] = value;
    return result;
  },
  remove: (values, field) => {
    if (!Object.prototype.hasOwnProperty.call(values, field)) return values;
    const result = {...values};
    delete result[field];
    return result;
  },
};

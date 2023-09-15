export declare namespace Access {
  type Field<A = any> = keyof A & string;
  type Get<V = any, A = V> = <F extends Field<A>>(values: V, field: F) => A[F];
  type Set<V = any, A = V> = <F extends Field<A>>(values: V, field: F, value: A[F]) => V;
  type Remove<V = any, A = V> = <F extends Field<A>>(values: V, field: F) => V;
  type Updater<V = any, A = V, F extends Field<A> = Field<A>> = (value: A[F]) => A[F];
  type Update<V = any, A = V> = <F extends Field<A>>(values: V, field: F, updater: Updater<V, A, F>) => V;
}

export type Access<V = any, A = V> = {
  get: Access.Get<V, A>,
  set: Access.Set<V, A>,
  remove: Access.Remove<V, A>,
  update?: Access.Update<V, A>,
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

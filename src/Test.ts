import * as Vest from "vest";
import {Access} from "./Access.js";

/*
A wrapper helper around Vest's `test` and `enforce`.
*/

export declare namespace Test {
  type Enforced = ReturnType<typeof Vest["enforce"]>;
  type Enforce = (message: string) => Enforced;
  type Body = (enforce: Enforce) => void | Promise<void>;
}

export type Test<V = any, A = V> = (field: Access.Field<A>, test: Test.Body) => void;

export const Test = <V, A = V>(values: V, get: Access.Get<V, A>) => {
  const test: Test<V, A> = (field, run) => {
    Vest.test(field, () => {
      const value = get(values, field);
      const enforce = (message: string) => Vest.enforce(value).message(message);
      return run(enforce);
    });
  };

  return test;
};

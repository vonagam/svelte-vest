import * as Vest from "vest";
import {Access} from "./Access.js";
import {Test} from "./Test.js";

export declare namespace Suite {
  type Body<V = any, A = V> = (values: V, test: Test<V, A>) => void;
  type Selector<A = any> = Access.Field<A> | Access.Field<A>[];
  type Callback<V = any, A = V> = (values: V, only?: Selector<A>) => void;
  type Result<V = any, A = V> = Vest.SuiteResult<Access.Field<A>, string>;
  type RunResult<V = any, A = V> = Vest.SuiteRunResult<Access.Field<A>, string>;
  type Failure<V = any, A = V> = Result<V, A>["errors"] extends (infer T)[] ? T : never;
}

export type Suite<V = any, A = V> = Vest.Suite<Access.Field<A>, string, Suite.Callback<V, A>>;

export const Suite = <V, A = V>(run: Suite.Body<V, A>, get: Access.Get<V, A>) => {
  const suite: Suite<V, A> = Vest.create((values: V, only?: Suite.Selector<A>) => {
    Vest.only(only);
    const test = Test(values, get);
    run(values, test);
  });

  return suite;
};

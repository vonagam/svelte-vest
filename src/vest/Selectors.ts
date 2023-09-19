export declare namespace Selectors {
  export type Summary = {
    errorCount: number,
    warnCount: number,
    testCount: number,
    pendingCount: number,
    valid: boolean,
  };

  export type Selector = (summary?: Summary) => boolean;
}

export const Selectors = {
  valid: (summary?: Selectors.Summary) => !!summary?.valid,
  invalid: (summary?: Selectors.Summary) => !!summary?.errorCount,
  tested: (summary?: Selectors.Summary) => !!summary?.testCount,
  untested: (summary?: Selectors.Summary) => !summary?.testCount,
  pending: (summary?: Selectors.Summary) => !!summary?.pendingCount,
  warned: (summary?: Selectors.Summary) => !!summary?.warnCount,
  uncertain: (summary?: Selectors.Summary) => !summary?.valid && !summary?.errorCount,
  omitted: (summary?: Selectors.Summary) => !!summary?.valid && !summary?.testCount,
};

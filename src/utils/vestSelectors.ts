export declare namespace vestSelectors {
  export type Summary = {
    errorCount: number,
    warnCount: number,
    testCount: number,
    pendingCount: number,
    valid: boolean,
  };

  export type Selector = (summary?: Summary) => boolean;
}

export const vestSelectors = {
  valid: (summary?: vestSelectors.Summary) => !!summary?.valid,
  invalid: (summary?: vestSelectors.Summary) => !!summary?.errorCount,
  tested: (summary?: vestSelectors.Summary) => !!summary?.testCount,
  untested: (summary?: vestSelectors.Summary) => !summary?.testCount,
  pending: (summary?: vestSelectors.Summary) => !!summary?.pendingCount,
  warned: (summary?: vestSelectors.Summary) => !!summary?.warnCount,
  uncertain: (summary?: vestSelectors.Summary) => !summary?.valid && !summary?.errorCount,
  omitted: (summary?: vestSelectors.Summary) => !!summary?.valid && !!summary?.testCount,
};

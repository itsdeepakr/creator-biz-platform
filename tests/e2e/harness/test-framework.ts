/**
 * Standalone Zero-Dependency Test Framework for E2E Test Execution
 */

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
}

export interface SuiteResult {
  name: string;
  passed: boolean;
  tests: TestResult[];
  durationMs: number;
}

type TestFn = () => void | Promise<void>;
type HookFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeEachHooks: HookFn[];
  afterEachHooks: HookFn[];
  beforeAllHooks: HookFn[];
  afterAllHooks: HookFn[];
}

class TestRunnerContext {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private results: SuiteResult[] = [];

  describe(name: string, fn: () => void): void {
    const previousSuite = this.currentSuite;
    const suite: TestSuite = {
      name,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: [],
    };

    this.suites.push(suite);
    this.currentSuite = suite;

    try {
      fn();
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  it(name: string, fn: TestFn): void {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be defined inside a describe block.`);
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn: HookFn): void {
    if (!this.currentSuite) {
      throw new Error(`beforeEach hook must be defined inside a describe block.`);
    }
    this.currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn: HookFn): void {
    if (!this.currentSuite) {
      throw new Error(`afterEach hook must be defined inside a describe block.`);
    }
    this.currentSuite.afterEachHooks.push(fn);
  }

  beforeAll(fn: HookFn): void {
    if (!this.currentSuite) {
      throw new Error(`beforeAll hook must be defined inside a describe block.`);
    }
    this.currentSuite.beforeAllHooks.push(fn);
  }

  afterAll(fn: HookFn): void {
    if (!this.currentSuite) {
      throw new Error(`afterAll hook must be defined inside a describe block.`);
    }
    this.currentSuite.afterAllHooks.push(fn);
  }

  async runAll(verbose = true): Promise<{ passed: boolean; suites: SuiteResult[]; totalTests: number; totalPassed: number; totalFailed: number; totalDurationMs: number }> {
    this.results = [];
    const totalStart = Date.now();
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.suites) {
      const suiteStart = Date.now();
      const suiteResult: SuiteResult = {
        name: suite.name,
        passed: true,
        tests: [],
        durationMs: 0,
      };

      if (verbose) {
        console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);
      }

      // beforeAll
      for (const hook of suite.beforeAllHooks) {
        await hook();
      }

      for (const test of suite.tests) {
        totalTests++;
        const testStart = Date.now();
        let passed = true;
        let testError: Error | undefined;

        try {
          for (const hook of suite.beforeEachHooks) {
            await hook();
          }

          await test.fn();

          for (const hook of suite.afterEachHooks) {
            await hook();
          }
        } catch (err: any) {
          passed = false;
          testError = err instanceof Error ? err : new Error(String(err));
          suiteResult.passed = false;
        }

        const durationMs = Date.now() - testStart;
        if (passed) {
          totalPassed++;
          if (verbose) {
            console.log(`  \x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${durationMs}ms)\x1b[0m`);
          }
        } else {
          totalFailed++;
          if (verbose) {
            console.log(`  \x1b[31m✖\x1b[0m ${test.name} \x1b[90m(${durationMs}ms)\x1b[0m`);
            console.log(`    \x1b[31mError: ${testError?.message}\x1b[0m`);
            if (testError?.stack) {
              const relevantStack = testError.stack
                .split('\n')
                .slice(1, 4)
                .join('\n');
              console.log(`    \x1b[90m${relevantStack}\x1b[0m`);
            }
          }
        }

        suiteResult.tests.push({
          suiteName: suite.name,
          testName: test.name,
          passed,
          durationMs,
          error: testError,
        });
      }

      // afterAll
      for (const hook of suite.afterAllHooks) {
        await hook();
      }

      suiteResult.durationMs = Date.now() - suiteStart;
      this.results.push(suiteResult);
    }

    const totalDurationMs = Date.now() - totalStart;
    const allPassed = totalFailed === 0;

    return {
      passed: allPassed,
      suites: this.results,
      totalTests,
      totalPassed,
      totalFailed,
      totalDurationMs,
    };
  }

  clear(): void {
    this.suites = [];
    this.currentSuite = null;
    this.results = [];
  }
}

export const runnerContext = new TestRunnerContext();

export function describe(name: string, fn: () => void): void {
  runnerContext.describe(name, fn);
}

export function it(name: string, fn: TestFn): void {
  runnerContext.it(name, fn);
}

export function beforeEach(fn: HookFn): void {
  runnerContext.beforeEach(fn);
}

export function afterEach(fn: HookFn): void {
  runnerContext.afterEach(fn);
}

export function beforeAll(fn: HookFn): void {
  runnerContext.beforeAll(fn);
}

export function afterAll(fn: HookFn): void {
  runnerContext.afterAll(fn);
}

export function expect<T = any>(actual: T) {
  return {
    toBe(expected: T): void {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} (type: ${typeof expected}), but received ${JSON.stringify(actual)} (type: ${typeof actual})`);
      }
    },
    toEqual(expected: any): void {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) {
        throw new Error(`Expected deep equality:\nExpected: ${e}\nActual:   ${a}`);
      }
    },
    toBeTruthy(): void {
      if (!actual) {
        throw new Error(`Expected truthy value, but received: ${actual}`);
      }
    },
    toBeFalsy(): void {
      if (actual) {
        throw new Error(`Expected falsy value, but received: ${actual}`);
      }
    },
    toBeNull(): void {
      if (actual !== null) {
        throw new Error(`Expected null, but received: ${actual}`);
      }
    },
    toBeUndefined(): void {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, but received: ${actual}`);
      }
    },
    toBeDefined(): void {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined, but was undefined`);
      }
    },
    toBeGreaterThan(expected: number): void {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number): void {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeLessThan(expected: number): void {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number): void {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} <= ${expected}`);
      }
    },
    toContain(item: any): void {
      if (typeof actual === 'string') {
        if (!actual.includes(String(item))) {
          throw new Error(`Expected "${actual}" to contain "${item}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
        }
      } else {
        throw new Error(`toContain called on non-collection: ${actual}`);
      }
    },
    toMatch(regex: RegExp): void {
      if (typeof actual !== 'string' || !regex.test(actual)) {
        throw new Error(`Expected "${actual}" to match pattern ${regex}`);
      }
    },
    toHaveLength(len: number): void {
      if (!actual || typeof (actual as any).length !== 'number' || (actual as any).length !== len) {
        throw new Error(`Expected length ${len}, but got ${(actual as any)?.length}`);
      }
    },
    toThrow(expectedMessageOrClass?: string | RegExp | Function): void {
      if (typeof actual !== 'function') {
        throw new Error(`Expected function for toThrow, received ${typeof actual}`);
      }
      let threw = false;
      let thrownError: any;
      try {
        (actual as any)();
      } catch (err) {
        threw = true;
        thrownError = err;
      }
      if (!threw) {
        throw new Error(`Expected function to throw, but it did not throw`);
      }
      if (expectedMessageOrClass) {
        if (typeof expectedMessageOrClass === 'string') {
          if (!thrownError.message.includes(expectedMessageOrClass)) {
            throw new Error(`Expected error message to contain "${expectedMessageOrClass}", got "${thrownError.message}"`);
          }
        } else if (expectedMessageOrClass instanceof RegExp) {
          if (!expectedMessageOrClass.test(thrownError.message)) {
            throw new Error(`Expected error message to match ${expectedMessageOrClass}, got "${thrownError.message}"`);
          }
        }
      }
    },
    not: {
      toBe(expected: T): void {
        if (actual === expected) {
          throw new Error(`Expected value NOT to be ${JSON.stringify(expected)}`);
        }
      },
      toEqual(expected: any): void {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          throw new Error(`Expected values NOT to be deeply equal: ${JSON.stringify(actual)}`);
        }
      },
      toContain(item: any): void {
        if (typeof actual === 'string' && actual.includes(String(item))) {
          throw new Error(`Expected "${actual}" NOT to contain "${item}"`);
        }
        if (Array.isArray(actual) && actual.includes(item)) {
          throw new Error(`Expected array NOT to contain ${JSON.stringify(item)}`);
        }
      },
      toBeNull(): void {
        if (actual === null) {
          throw new Error(`Expected value NOT to be null`);
        }
      },
      toBeUndefined(): void {
        if (actual === undefined) {
          throw new Error(`Expected value NOT to be undefined`);
        }
      },
    },
  };
}

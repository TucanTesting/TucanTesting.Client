import { Component, OnInit, Input } from '@angular/core';
import { TestCase, TestModule, TestIssue } from '@models';
import { DialogType, Priority, TestResultStatus } from '../../../enums';

@Component({
  selector: 'test-module',
  templateUrl: './test-module.component.html'
})
export class TestModuleComponent {
  @Input() testModule: TestModule;
  @Input() isTestRun: boolean = false;
  @Input() testRunId: number;
  testCases: TestCase[];
  priority = Priority;
  testResultStatus = TestResultStatus;


  // Filters
  statusFilters = {
    showPass: true,
    showFail: true,
    showCnt: true,
    showNa: true,
    showPending: true
  };

  filters = {
    onlyNeverTested: false,
    needsCriteria: false,
    isAutomated: false,
    isManual: false,
    notAutomated: false,
    hasIssues: false
  };

  constructor(
  ) {
  }

  filterTestCases() {
    const results: TestCase[] = this.testModule.testCases.slice(0);

    if (this.filters.onlyNeverTested) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].lastTested) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (this.filters.needsCriteria) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].hasCriteria) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (this.filters.isAutomated) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (!results[i].isAutomated) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (this.filters.isManual) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].isAutomated) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (this.filters.hasIssues) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].testIssues.length < 1) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (!this.statusFilters.showPass) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].testResult && results[i].testResult.status === TestResultStatus.Pass) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (!this.statusFilters.showFail) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].testResult && results[i].testResult.status === TestResultStatus.Fail) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (!this.statusFilters.showCnt) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].testResult && results[i].testResult.status === TestResultStatus.CNT) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (!this.statusFilters.showNa) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].testResult && results[i].testResult.status === TestResultStatus.NA) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    if (!this.statusFilters.showPending) {
      for (let i = results.length - 1; i >= 0; i--) {
        if (!results[i].testResult || results[i].testResult.status === TestResultStatus.Pending) {
          results.splice(results.indexOf(results[i]), 1)
        }
      }
    }

    return results;
  }

  selectAllStatusFilters() {
    for (const prop in this.statusFilters) {
      if (this.statusFilters.hasOwnProperty(prop)) {
        this.statusFilters[prop] = true;
      }
    }
  }

  clearStatusFilters() {
    for (const prop in this.statusFilters) {
      if (this.statusFilters.hasOwnProperty(prop)) {
        this.statusFilters[prop] = false;
      }
    }
  }

  displayFriendly(ugly: string) {
    let friendly = '';
    switch (ugly) {
      case 'description':
        friendly = 'Description';
        break;
      case 'priority':
        friendly = 'Priority';
        break;
      case 'lastTested':
        friendly = 'Last Tested';
        break;
      case 'isAutomated':
        friendly = 'Automated';
        break;
      case 'hasCriteria':
        friendly = 'Needs Criteria';
        break;
      default:
        break;
    }
    return friendly;
  }
}

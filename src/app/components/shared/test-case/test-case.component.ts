import { Component, OnInit, Input } from '@angular/core';
import { TestCase, TestModule, TestIssue, TestRun } from '@models';
import { ToastrService } from 'ngx-toastr';
import { HandleErrorService, TestCasesService, TestIssuesService, TestModulesService, ExpectedResultsService, TestResultsService, TestRunsService } from '@services';
import { MatDialog } from '@angular/material';
import { ViewTestCaseDialogComponent } from '@components/shared/dialogs/test-case/view-test-case-dialog.component';
import { DeleteDialogComponent } from '@components/shared/dialogs/delete/delete-dialog.component';
import { CreateTestCaseDialogComponent } from '@components/shared/dialogs/create/test-case/create-test-case-dialog.component';
import { LogIssueDialogComponent } from '@components/shared/dialogs/create/log-issue/log-issue-dialog.component';
import { TestResultStatus, Priority } from '../../../enums';

@Component({
  selector: 'tt-test-case',
  styleUrls: ['test-case.component.scss'],
  templateUrl: './test-case.component.html'
})
export class TestCaseComponent {
  @Input() testModule: TestModule;
  @Input() testCase: TestCase;
  @Input() isTestRun: boolean = false;
  @Input() isTestReport: boolean = false;
  @Input() testRunId: number;
  priority = Priority;
  testResultStatus = TestResultStatus;

  constructor(
    private toastr: ToastrService,
    private handleErrorService: HandleErrorService,
    private testCasesService: TestCasesService,
    private testIssuesService: TestIssuesService,
    private testModulesService: TestModulesService,
    private expectedResultsService: ExpectedResultsService,
    private testResultsService: TestResultsService,
    private testRunsService: TestRunsService,
    public dialog: MatDialog
  ) {
  }

  openTestCaseViewDialog(testModule: TestModule, testCase: TestCase, type?: string): void {
    const dialogRef = this.dialog.open(ViewTestCaseDialogComponent, {
      data: {
        title: testCase.description,
        testModule: testModule,
        testCase: testCase,
        isTestReport: this.isTestReport,
        type: type
      }
    });

    dialogRef.afterClosed()
      .subscribe(res => {
      });
  }

  openTestCaseDeleteDialog(testCase: TestCase): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { title: testCase.description } });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.deleteTestCase(testCase)
      }
    });
  }

  openTestCaseEditDialog(testCase: TestCase, testSuiteId?: number): void {
    const dialogRef = this.dialog.open(CreateTestCaseDialogComponent, { data: { title: 'Update a Test Case', payload: testCase, testSuiteId: (testSuiteId) ? testSuiteId : null, testModule: this.testModule } });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        testCase.description = res.description;
        testCase.lastTested = res.lastTested;
        testCase.automationId = res.automationId;
        testCase.isAutomated = res.isAutomated;
        testCase.hasCriteria = res.hasCriteria;
        testCase.priority = res.priority;
        testCase.testModuleId = res.testModuleId;
        this.updateTestCase(testCase)
      }
    });
  }

  openLogIssueDialog(testCase: TestCase, testRunId?: number): void {
    const dialogRef = this.dialog.open(LogIssueDialogComponent, { data: { title: 'Log an Issue' } });

    dialogRef.afterClosed().subscribe((testIssue: TestIssue) => {
      if (testIssue) {
        testIssue.testCaseId = testCase.id;
        testIssue.testRunId = testRunId || null;
        this.addTestIssue(testCase, testIssue)
      }
    });
  }

  addTestIssue(testCase: TestCase, testIssue: TestIssue) {
    this.testIssuesService.createTestIssue(testIssue)
      .subscribe((res: TestIssue) => {
        testCase.testIssues.push(testIssue);
      })
  }

  updateTestCase(testCase: TestCase): void {
    this.testCasesService.updateTestCase(testCase)
      .subscribe(res => {
        testCase = res;
        if (testCase.testModuleId !== this.testModule.id) {
          const index = this.testModule.testCases.findIndex(tc => tc.id === testCase.id);
          this.testModule.testCases.splice(index, 1)
        }
        this.toastr.success(res.description, 'UPDATED');
      }, error => {
        this.handleErrorService.handleError(error);
      });
  }

  duplicateTestCase(testCase: TestCase) {
    this.testCasesService.duplicateTestCase(testCase)
      .subscribe((res: TestCase) => {
        this.testModule.testCases.push(res);
        this.toastr.success(res.description, 'COPIED');
      }, error => {
        this.handleErrorService.handleError(error);
      });
  }

  deleteTestCase(testCase: TestCase) {
    this.testCasesService.deleteTestCase(testCase)
      .subscribe(success => {
        const index = this.testModule.testCases.indexOf(testCase);
        if (index > -1) {
          this.testModule.testCases.splice(index, 1);
        }
        this.toastr.success(testCase.description, 'DELETED');
      }, error => {
        this.handleErrorService.handleError(error);
      });
  }

  changeTestCaseStatus(testCase: TestCase, status: TestResultStatus) {
    if (testCase.testResult && testCase.testResult.testRunId === this.testRunId) {
      testCase.testResult.status = status;
      this.updateTestResult(testCase);
    } else {
      testCase.testResult = {
        testCaseId: testCase.id,
        testRunId: this.testRunId,
        testModuleId: testCase.testModuleId,
        status: status
      };
      this.createTestResult(testCase);
    }
    this.updateTestRun(testCase.testResult.testRunId)
  }

  updateTestResult(testCase: TestCase) {
    this.testResultsService.updateTestResult(testCase.testResult)
      .subscribe(res => {
        testCase.testResult = res;
        if (testCase.testResult.status === TestResultStatus.Pass || testCase.testResult.status === TestResultStatus.Fail) {
          testCase.lastTested = new Date(Date.now());
          this.updateTestCase(testCase);
        }
      }, error => {
        this.handleErrorService.handleError(error);
      });
  }

  createTestResult(testCase: TestCase) {
    this.testResultsService.createTestResult(testCase.testResult)
      .subscribe(res => {
        testCase.testResult = res;
        if (testCase.testResult.status === TestResultStatus.Pass || testCase.testResult.status === TestResultStatus.Fail) {
          testCase.lastTested = new Date(Date.now());
          this.updateTestCase(testCase);
        }
      }, error => {
        this.handleErrorService.handleError(error);
      });
  }

  updateTestRun(testRunId: number) {
    this.testRunsService.getTestRun(testRunId)
      .subscribe((testRun: TestRun) => {
        this.testRunsService.updateTestRun(testRun)
          .subscribe(res => {
          })
      })
  }

}

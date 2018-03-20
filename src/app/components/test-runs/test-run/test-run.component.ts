// Fixes needed

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { TestModulesService, TestRunsService, TestResultsService, TestCasesService } from '@services';
import { TestRun, TestModule, TestCase, TestResult } from '@models';
import { TestResultStatus, Priority } from '../../../enums';

@Component({
    styleUrls: ['./test-run.component.scss'],
    selector: 'test-run',
    templateUrl: './test-run.component.html'
})
export class TestRunComponent {
    testRun: TestRun;
    testRunId: number;
    testCases: TestCase[];
    testResults: TestResult[] = [];
    testModules: TestModule[];
    testResultStatus = TestResultStatus;
    priority = Priority;

    constructor(
        private testRunsService: TestRunsService,
        private testModulesService: TestModulesService,
        private testCasesService: TestCasesService,
        private testResultsService: TestResultsService,
        private route: ActivatedRoute,
        public dialog: MatDialog) {
    }

    ngOnInit() {
        this.route.paramMap
            .subscribe(params => {
                this.testRunId = this.route.snapshot.params['id'];
                this.testRunsService
                    .getTestRun(this.testRunId)
                    .subscribe(testRun => {
                        this.testRun = testRun;
                        this.testModulesService
                            .getTestModules(testRun.testSuiteId, testRun.createdAt)
                            .subscribe(testModules => {
                                this.testModules = testModules.map(testModule => ({
                                    ...testModule,
                                    sort: null,
                                    reverse: false,
                                }));
                            })
                    })

            })
    }

    getTestResults(testModule: TestModule) {
        const index = this.testModules.indexOf(testModule);
        this.testCasesService
            .getTestCases(testModule, this.testRun.createdAt)
            .subscribe(testCases => {
                this.testModules[index].testCases = testCases;
                this.testResultsService.getTestResults(this.testRunId)
                    .subscribe(testResults => {
                        if (testResults.length > 0) {
                            this.testResults = testResults;
                            this.getTestModuleTestResults(testModule);
                        }
                    })
            });
    }

    changeTestCaseStatus(testCase: TestCase, status: TestResultStatus) {
        testCase.testResult = {
            testCaseId: testCase.id,
            testRunId: this.testRunId,
            status: status
        };
        this.testResultsService.upsertTestResult(testCase.testResult)
            .subscribe(testResult => {
                this.testResults.push(testResult)
            });
    }

    getTestModuleTestResults(testModule: TestModule) {
        this.testResults.forEach((testResult: TestResult) => {
            const testModuleIndex = this.testModules.indexOf(testModule);
            const testCaseIndex = this.testModules[testModuleIndex].testCases.findIndex(
                (c: TestCase) => c.id === testResult.testCaseId
            );
            if (testCaseIndex > -1) {
                this.testModules[testModuleIndex].testCases[testCaseIndex].testResult = testResult
            }
        })
    }
}

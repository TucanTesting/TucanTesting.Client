import { Component, Inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TestModule } from '@models';
import { DialogType } from './../../../../../enums';

interface IDialogData {
    title: string;
    type: DialogType;
    payload?: TestModule;
}

@Component({
    selector: 'create-test-module-dialog',
    templateUrl: './create-test-module-dialog.component.html',
})
export class CreateTestModuleDialogComponent {
    title: string;
    type: DialogType;
    testModuleForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<CreateTestModuleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDialogData) {
        this.title = data.title;
        this.type = data.type;
        this.createTestModuleForm();
    }

    createTestModuleForm() {
        this.testModuleForm = this.fb.group({
            name: null
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
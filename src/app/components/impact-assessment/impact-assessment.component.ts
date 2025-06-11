import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Service Impact interface
interface ServiceImpact {
  serviceDowntime: string; // HH:MM:SS format
  serviceRestorationDateTime: Date;
  isTemporaryActionsMeasuresForRecovery: boolean;
  descriptionOfTemporaryActionsMeasuresForRecovery: string;
}

// Affected Assets interface
interface AffectedAssets {
  affectedClients: {
    description: string;
    percentage: number;
  };
  affectedFinancialCounterparts: {
    description: string;
    percentage: number;
  };
  affectedTransactions: {
    description: string;
    percentage: number;
  };
  valueOfAffectedTransactions: number;
  numbersActualEstimate: string;
}

// Main Impact Assessment interface
export interface ImpactAssessment {
  hasImpactOnRelevantClients: boolean;
  serviceImpact: ServiceImpact;
  criticalServicesAffected: string;
  affectedAssets: AffectedAssets;
  affectedFunctionalAreas: string;
  isAffectedInfrastructureComponents: string;
  affectedInfrastructureComponents: string;
  isImpactOnFinancialInterest: string;
}

@Component({
  selector: 'app-impact-assessment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './impact-assessment.component.html',
  styleUrl: './impact-assessment.component.scss'
})
export class ImpactAssessmentComponent implements OnInit, OnChanges {
  @Input() incidentSubmission: 'initial_notification' | 'intermediate_report' | 'final_report' = 'initial_notification';
  @Output() impactAssessmentData = new EventEmitter<ImpactAssessment>();

  readonly MAX_TEXT_LENGTH = 32767;
  impactForm: FormGroup;

  // Custom validator for HH:MM:SS format
  private static timeFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
      return timeRegex.test(control.value) ? null : { invalidTimeFormat: true };
    };
  }

  // Custom validator for percentage range (0-100)
  private static percentageRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      return (value >= 0 && value <= 100) ? null : { invalidPercentage: true };
    };
  }

  constructor(private fb: FormBuilder) {
    // Create nested form groups first
    const serviceImpactGroup = this.fb.group({
      serviceDowntime: new FormControl('', {
        validators: [
          Validators.maxLength(this.MAX_TEXT_LENGTH),
          ImpactAssessmentComponent.timeFormatValidator()
        ],
        nonNullable: true
      }),
      serviceRestorationDateTime: new FormControl<Date | null>(null, {
        validators: [Validators.required],
        nonNullable: false
      }),
      isTemporaryActionsMeasuresForRecovery: new FormControl(false, {
        validators: [],
        nonNullable: true
      }),
      descriptionOfTemporaryActionsMeasuresForRecovery: new FormControl('', {
        validators: [Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      })
    });

    const affectedAssetsGroup = this.fb.group({
      affectedClients: this.fb.group({
        description: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
          nonNullable: true
        }),
        percentage: new FormControl(0, {
          validators: [
            Validators.required,
            ImpactAssessmentComponent.percentageRangeValidator()
          ],
          nonNullable: true
        })
      }),
      affectedFinancialCounterparts: this.fb.group({
        description: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
          nonNullable: true
        }),
        percentage: new FormControl(0, {
          validators: [
            Validators.required,
            ImpactAssessmentComponent.percentageRangeValidator()
          ],
          nonNullable: true
        })
      }),
      affectedTransactions: this.fb.group({
        description: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
          nonNullable: true
        }),
        percentage: new FormControl(0, {
          validators: [
            Validators.required,
            ImpactAssessmentComponent.percentageRangeValidator()
          ],
          nonNullable: true
        })
      }),
      valueOfAffectedTransactions: new FormControl(0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true
      }),
      numbersActualEstimate: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      })
    });

    // Create the main form group
    this.impactForm = this.fb.group({
      hasImpactOnRelevantClients: new FormControl(false, {
        validators: [],
        nonNullable: true
      }),
      serviceImpact: serviceImpactGroup,
      criticalServicesAffected: new FormControl('', {
        validators: [Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      }),
      affectedAssets: affectedAssetsGroup,
      affectedFunctionalAreas: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      }),
      isAffectedInfrastructureComponents: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true
      }),
      affectedInfrastructureComponents: new FormControl('', {
        validators: [Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      }),
      isImpactOnFinancialInterest: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)],
        nonNullable: true
      })
    });

    // Set up conditional validation for temporary actions description
    this.impactForm.get('serviceImpact.isTemporaryActionsMeasuresForRecovery')?.valueChanges
      .subscribe(hasTemporaryActions => {
        const descriptionControl = this.impactForm.get('serviceImpact.descriptionOfTemporaryActionsMeasuresForRecovery');
        if (hasTemporaryActions) {
          descriptionControl?.setValidators([Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)]);
        } else {
          descriptionControl?.setValidators([Validators.maxLength(this.MAX_TEXT_LENGTH)]);
        }
        descriptionControl?.updateValueAndValidity();
      });

    // Subscribe to checkbox changes to update validation
    this.impactForm.get('serviceImpact.isTemporaryActionsMeasuresForRecovery')?.valueChanges.subscribe(isChecked => {
      this.updateTemporaryActionsValidation(isChecked);
    });

    // Subscribe to radio button changes to update validation
    this.isAffectedInfrastructureComponentsControl.valueChanges.subscribe(value => {
      this.updateAffectedInfrastructureValidation(value);
    });

    // Initial validation update
    this.updateSubmissionTypeValidation();
  }

  // Getter methods for form controls
  get serviceDowntimeControl(): FormControl {
    return this.serviceImpactGroup.get('serviceDowntime') as FormControl;
  }

  get serviceImpactGroup(): FormGroup {
    return this.impactForm.get('serviceImpact') as FormGroup;
  }

  get isTemporaryActionsControl(): FormControl {
    return this.serviceImpactGroup.get('isTemporaryActionsMeasuresForRecovery') as FormControl;
  }

  get temporaryActionsDescriptionControl(): FormControl {
    return this.serviceImpactGroup.get('descriptionOfTemporaryActionsMeasuresForRecovery') as FormControl;
  }

  get criticalServicesAffectedControl(): FormControl {
    return this.impactForm.get('criticalServicesAffected') as FormControl;
  }

  get affectedAssetsGroup(): FormGroup {
    return this.impactForm.get('affectedAssets') as FormGroup;
  }

  // Helper getters for nested form groups
  get affectedClientsGroup(): FormGroup {
    return this.affectedAssetsGroup.get('affectedClients') as FormGroup;
  }

  get affectedFinancialCounterpartsGroup(): FormGroup {
    return this.affectedAssetsGroup.get('affectedFinancialCounterparts') as FormGroup;
  }

  get affectedTransactionsGroup(): FormGroup {
    return this.affectedAssetsGroup.get('affectedTransactions') as FormGroup;
  }

  // Helper getters for form controls
  get hasImpactOnRelevantClientsControl(): FormControl {
    return this.impactForm.get('hasImpactOnRelevantClients') as FormControl;
  }

  get affectedFunctionalAreasControl(): FormControl {
    return this.impactForm.get('affectedFunctionalAreas') as FormControl;
  }

  get isAffectedInfrastructureComponentsControl(): FormControl {
    return this.impactForm.get('isAffectedInfrastructureComponents') as FormControl;
  }

  get affectedInfrastructureComponentsControl(): FormControl {
    return this.impactForm.get('affectedInfrastructureComponents') as FormControl;
  }

  get isImpactOnFinancialInterestControl(): FormControl {
    return this.impactForm.get('isImpactOnFinancialInterest') as FormControl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incidentSubmission']) {
      this.updateSubmissionTypeValidation();
    }
  }

  ngOnInit(): void {
    this.updateSubmissionTypeValidation();
    
    // Subscribe to form value changes to emit updates
    this.impactForm.valueChanges.subscribe(value => {
      if (this.impactForm.valid) {
        this.impactAssessmentData.emit(value);
      }
    });
  }

  private updateSubmissionTypeValidation(): void {
    const isInitialOrIntermediate = this.incidentSubmission === 'initial_notification' || 
                                  this.incidentSubmission === 'intermediate_report';

    // Update critical services validation
    const criticalServicesControl = this.criticalServicesAffectedControl;
    if (isInitialOrIntermediate) {
      criticalServicesControl.setValidators([
        Validators.required,
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    } else {
      criticalServicesControl.setValidators([
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    }
    criticalServicesControl.updateValueAndValidity();

    // Update service downtime validation
    const serviceDowntimeControl = this.serviceDowntimeControl;
    if (isInitialOrIntermediate) {
      serviceDowntimeControl.setValidators([
        Validators.required,
        Validators.maxLength(this.MAX_TEXT_LENGTH),
        ImpactAssessmentComponent.timeFormatValidator()
      ]);
    } else {
      serviceDowntimeControl.setValidators([
        Validators.maxLength(this.MAX_TEXT_LENGTH),
        ImpactAssessmentComponent.timeFormatValidator()
      ]);
    }
    serviceDowntimeControl.updateValueAndValidity();
  }

  private updateTemporaryActionsValidation(isChecked: boolean): void {
    const descriptionControl = this.temporaryActionsDescriptionControl;
    if (isChecked) {
      descriptionControl.setValidators([
        Validators.required,
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    } else {
      descriptionControl.setValidators([
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    }
    descriptionControl.updateValueAndValidity();
  }

  private updateAffectedInfrastructureValidation(value: string): void {
    const descriptionControl = this.affectedInfrastructureComponentsControl;
    if (value === 'yes') {
      descriptionControl.setValidators([
        Validators.required,
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    } else {
      descriptionControl.setValidators([
        Validators.maxLength(this.MAX_TEXT_LENGTH)
      ]);
    }
    descriptionControl.updateValueAndValidity();
  }

  // Method to get the form value
  getFormValue(): ImpactAssessment {
    return this.impactForm.value;
  }

  // Method to reset the form
  resetForm(): void {
    this.impactForm.reset({
      hasImpactOnRelevantClients: false,
      serviceImpact: {
        isTemporaryActionsMeasuresForRecovery: false
      },
      affectedAssets: {
        valueOfAffectedTransactions: 0
      }
    });
  }

  // Method to check if form is valid
  isValid(): boolean {
    return this.impactForm.valid;
  }
} 
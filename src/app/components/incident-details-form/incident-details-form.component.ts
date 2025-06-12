import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors, ValidatorFn, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Custom validator for incidentDuration
export function incidentDurationValidator(): ValidatorFn {
  const regex = /^\d{1,3}:(?:[01]\d|2[0-3]):[0-5]\d$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return regex.test(value) ? null : { invalidIncidentDuration: true };
  };
}

// Dropdown/enum options
export const CLASSIFICATION_CRITERION_OPTIONS = [
  { value: 'geographical_spread', label: 'Geographical Spread' },
  { value: 'data_losses', label: 'Data Losses' },
  { value: 'reputational_impact', label: 'Reputational Impact' },
  { value: 'economic_impact', label: 'Economic Impact' },
  { value: 'duration_and_service_downtime', label: 'Duration and Service Downtime' }
];

export const INCIDENT_DISCOVERY_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'customer', label: 'Customer' },
  { value: 'other', label: 'Other' }
];

export const INCIDENT_CLASSIFICATION_OPTIONS = [
  { value: 'cybersecurity-related', label: 'Cybersecurity-related' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'system_failure', label: 'System Failure' },
  { value: 'process_failure', label: 'Process Failure' },
  { value: 'other', label: 'Other' }
];

export const THREAT_TECHNIQUES_OPTIONS = [
  { value: 'malware', label: 'Malware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'ddos', label: 'DDoS' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'other', label: 'Other' }
];

export const ROOT_CAUSE_HL_CLASSIFICATION_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'third_party', label: 'Third Party' },
  { value: 'Other', label: 'Other' }
];

export const ROOT_CAUSES_DETAILED_CLASSIFICATION_OPTIONS = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'network', label: 'Network' },
  { value: 'human_error', label: 'Human Error' },
  { value: 'Other', label: 'Other' }
];

export const ROOT_CAUSES_ADDITIONAL_CLASSIFICATION_OPTIONS = [
  { value: 'configuration', label: 'Configuration' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'Other', label: 'Other' }
];

@Component({
  selector: 'app-incident-details-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule
  ],
  templateUrl: './incident-details-form.component.html',
  styleUrls: ['./incident-details-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IncidentDetailsFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IncidentDetailsFormComponent),
      multi: true
    }
  ]
})
export class IncidentDetailsFormComponent implements OnInit, ControlValueAccessor {
  @Input() incidentType: string | null = null; // expects 'final_report', 'intermediate_report', etc.
  incidentDetailsForm: FormGroup;

  get classificationTypes(): FormArray {
    return this.incidentDetailsForm.get('classificationTypes') as FormArray;
  }

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
    if (obj) {
      this.incidentDetailsForm.patchValue(obj, { emitEvent: false });
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.incidentDetailsForm.disable();
    } else {
      this.incidentDetailsForm.enable();
    }
  }

  validate(_: AbstractControl): ValidationErrors | null {
    return this.incidentDetailsForm.valid ? null : { incidentDetails: { valid: false } };
  }

  constructor(private fb: FormBuilder) {
    this.incidentDetailsForm = this.fb.group({
      financialEntityCode: [''],
      detectionDate: [null],
      detectionTime: [null],
      classificationDate: [null],
      classificationTime: [null],
      incidentOccurrenceDate: [null],
      incidentOccurrenceTime: [null],
      incidentDescription: [''],
      isBusinessContinuityActivated: [false],
      incidentDuration: ['', incidentDurationValidator()],
      originatesFromThirdPartyProvider: [''],
      incidentDiscovery: [''],
      competentAuthorityCode: [''],
      indicatorsOfCompromise: [''],
      incidentResolutionSummary: [''],
      incidentResolutionDate: [null],
      incidentResolutionTime: [null],
      incidentResolutionVsPlannedImplementation: [''],
      assessmentOfRiskToCriticalFunctions: [''],
      informationRelevantToResolutionAuthorities: [''],
      financialRecoveriesAmount: [null],
      grossAmountIndirectDirectCosts: [null],
      recurringNonMajorIncidentsDescription: [''],
      recurringIncidentDate: [null],
      incidentClassification: [''],
      classificationTypes: this.fb.array([]),
      incidentType: this.fb.group({
        incidentClassification: [[], Validators.required],
        otherIncidentClassification: [''],
        threatTechniques: [[]],
        otherThreatTechniques: ['']
      }),
      rootCauseHLClassification: [[]],
      rootCausesDetailedClassification: [[]],
      rootCausesAdditionalClassification: [[]],
      rootCausesOther: [''],
      rootCausesInformation: [''],
      rootCauseAddressingDate: [null],
      rootCauseAddressingTime: [null]
    });
  }

  private combineDateAndTime(date: Date | null, time: string | null): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    return combinedDate;
  }

  private updateFormValue(): void {
    const formValue = this.incidentDetailsForm.value;
    
    // Combine Detection Date & Time
    const detectionDateTime = this.combineDateAndTime(formValue.detectionDate, formValue.detectionTime);
    // Combine Classification Date & Time
    const classificationDateTime = this.combineDateAndTime(formValue.classificationDate, formValue.classificationTime);
    // Combine Incident Occurrence Date & Time
    const incidentOccurrenceDateTime = this.combineDateAndTime(formValue.incidentOccurrenceDate, formValue.incidentOccurrenceTime);
    // Combine Incident Resolution Date & Time
    const resolutionDate = formValue.incidentResolutionDate;
    const resolutionTime = formValue.incidentResolutionTime;
    const combinedResolutionDateTime = this.combineDateAndTime(resolutionDate, resolutionTime);
    // Combine Root Cause Addressing Date & Time
    const addressingDate = formValue.rootCauseAddressingDate;
    const addressingTime = formValue.rootCauseAddressingTime;
    const combinedAddressingDateTime = this.combineDateAndTime(addressingDate, addressingTime);

    // Update the form value with combined date-times
    const updatedValue = {
      ...formValue,
      detectionDateTime,
      classificationDateTime,
      incidentOccurrenceDateTime,
      incidentResolutionDateTime: combinedResolutionDateTime,
      rootCauseAddressingDateTime: combinedAddressingDateTime
    };

    this.onChange(updatedValue);
  }

  ngOnInit(): void {
    this.incidentDetailsForm.valueChanges.subscribe(() => {
      this.updateFormValue();
      this.updateConditionalValidators();
      this.updateClassificationTypeValidators();
      this.updateIncidentTypeValidators();
      this.updateRootCausesValidators();
    });
    this.updateConditionalValidators();
    this.updateClassificationTypeValidators();
    this.updateIncidentTypeValidators();
    this.updateRootCausesValidators();
  }

  addClassificationType(): void {
    const group = this.fb.group({
      classificationCriterion: ['', Validators.required],
      countryCodeMaterialityThresholds: [[]],
      memberStatesImpactType: [''],
      memberStatesImpactTypeDescription: [''],
      dataLosseMaterialityThresholds: [[]],
      dataLossesDescription: [''],
      reputationalImpactType: [[]],
      reputationalImpactDescription: [''],
      economicImpactMaterialityThreshold: ['']
    });
    this.classificationTypes.push(group);
  }

  updateClassificationTypeValidators(): void {
    this.classificationTypes.controls.forEach((group: AbstractControl) => {
      const criterion = group.get('classificationCriterion')?.value;
      // Clear all validators first
      group.get('countryCodeMaterialityThresholds')?.clearValidators();
      group.get('memberStatesImpactType')?.clearValidators();
      group.get('memberStatesImpactTypeDescription')?.clearValidators();
      group.get('dataLosseMaterialityThresholds')?.clearValidators();
      group.get('dataLossesDescription')?.clearValidators();
      group.get('reputationalImpactType')?.clearValidators();
      group.get('reputationalImpactDescription')?.clearValidators();
      group.get('economicImpactMaterialityThreshold')?.clearValidators();

      if (criterion === 'geographical_spread') {
        group.get('countryCodeMaterialityThresholds')?.setValidators([Validators.required]);
        group.get('memberStatesImpactType')?.setValidators([Validators.required]);
        group.get('memberStatesImpactTypeDescription')?.setValidators([Validators.required]);
      } else if (criterion === 'data_losses') {
        group.get('dataLosseMaterialityThresholds')?.setValidators([Validators.required]);
        group.get('dataLossesDescription')?.setValidators([Validators.required]);
      } else if (criterion === 'reputational_impact') {
        group.get('reputationalImpactType')?.setValidators([Validators.required]);
        group.get('reputationalImpactDescription')?.setValidators([Validators.required]);
      } else if (criterion === 'economic_impact') {
        group.get('economicImpactMaterialityThreshold')?.setValidators([Validators.required]);
      }
      // No additional fields for duration_and_service_downtime

      group.get('countryCodeMaterialityThresholds')?.updateValueAndValidity({ onlySelf: true });
      group.get('memberStatesImpactType')?.updateValueAndValidity({ onlySelf: true });
      group.get('memberStatesImpactTypeDescription')?.updateValueAndValidity({ onlySelf: true });
      group.get('dataLosseMaterialityThresholds')?.updateValueAndValidity({ onlySelf: true });
      group.get('dataLossesDescription')?.updateValueAndValidity({ onlySelf: true });
      group.get('reputationalImpactType')?.updateValueAndValidity({ onlySelf: true });
      group.get('reputationalImpactDescription')?.updateValueAndValidity({ onlySelf: true });
      group.get('economicImpactMaterialityThreshold')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  updateIncidentTypeValidators(): void {
    const group = this.incidentDetailsForm.get('incidentType') as FormGroup;
    const incidentClassification: string[] = group.get('incidentClassification')?.value || [];
    const threatTechniques: string[] = group.get('threatTechniques')?.value || [];

    // otherIncidentClassification required if 'other' is selected
    if (incidentClassification.includes('other')) {
      group.get('otherIncidentClassification')?.setValidators([Validators.required]);
    } else {
      group.get('otherIncidentClassification')?.clearValidators();
    }
    group.get('otherIncidentClassification')?.updateValueAndValidity({ onlySelf: true });

    // otherThreatTechniques required if 'other' is selected in threatTechniques
    if (threatTechniques.includes('other')) {
      group.get('otherThreatTechniques')?.setValidators([Validators.required]);
    } else {
      group.get('otherThreatTechniques')?.clearValidators();
    }
    group.get('otherThreatTechniques')?.updateValueAndValidity({ onlySelf: true });
  }

  updateRootCausesValidators(): void {
    const rootHL: string[] = this.incidentDetailsForm.get('rootCauseHLClassification')?.value || [];
    const rootDetailed: string[] = this.incidentDetailsForm.get('rootCausesDetailedClassification')?.value || [];
    const rootAdditional: string[] = this.incidentDetailsForm.get('rootCausesAdditionalClassification')?.value || [];
    const rootOther = this.incidentDetailsForm.get('rootCausesOther');
    // If 'Other' is selected in any of the three multi-selects, require rootCausesOther
    if ([...rootHL, ...rootDetailed, ...rootAdditional].includes('Other')) {
      rootOther?.setValidators([Validators.required]);
    } else {
      rootOther?.clearValidators();
    }
    rootOther?.updateValueAndValidity({ onlySelf: true });
  }

  updateConditionalValidators(): void {
    const type = this.incidentType;
    const f = this.incidentDetailsForm;

    // financialEntityCode, incidentDescription required for final_report and intermediate_report
    if (type === 'final_report' || type === 'intermediate_report') {
      f.get('financialEntityCode')?.setValidators([Validators.required]);
      f.get('incidentDescription')?.setValidators([Validators.required]);
    } else {
      f.get('financialEntityCode')?.clearValidators();
      f.get('incidentDescription')?.clearValidators();
    }
    f.get('financialEntityCode')?.updateValueAndValidity({ onlySelf: true });
    f.get('incidentDescription')?.updateValueAndValidity({ onlySelf: true });

    // The following are required only for final_report
    if (type === 'final_report') {
      f.get('incidentResolutionSummary')?.setValidators([Validators.required]);
      f.get('incidentResolutionDate')?.setValidators([Validators.required]);
      f.get('incidentResolutionTime')?.setValidators([Validators.required]);
      f.get('incidentResolutionVsPlannedImplementation')?.setValidators([Validators.required]);
      f.get('financialRecoveriesAmount')?.setValidators([Validators.required]);
      f.get('incidentClassification')?.setValidators([Validators.required]);
    } else {
      f.get('incidentResolutionSummary')?.clearValidators();
      f.get('incidentResolutionDate')?.clearValidators();
      f.get('incidentResolutionTime')?.clearValidators();
      f.get('incidentResolutionVsPlannedImplementation')?.clearValidators();
      f.get('financialRecoveriesAmount')?.clearValidators();
      f.get('incidentClassification')?.clearValidators();
    }
    f.get('incidentResolutionSummary')?.updateValueAndValidity({ onlySelf: true });
    f.get('incidentResolutionDate')?.updateValueAndValidity({ onlySelf: true });
    f.get('incidentResolutionTime')?.updateValueAndValidity({ onlySelf: true });
    f.get('incidentResolutionVsPlannedImplementation')?.updateValueAndValidity({ onlySelf: true });
    f.get('financialRecoveriesAmount')?.updateValueAndValidity({ onlySelf: true });
    f.get('incidentClassification')?.updateValueAndValidity({ onlySelf: true });
  }

  hasOtherRootCause(): boolean {
    const hl = this.incidentDetailsForm.get('rootCauseHLClassification')?.value || [];
    const detailed = this.incidentDetailsForm.get('rootCausesDetailedClassification')?.value || [];
    const additional = this.incidentDetailsForm.get('rootCausesAdditionalClassification')?.value || [];
    return [...hl, ...detailed, ...additional].includes('Other');
  }
}
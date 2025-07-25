import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors, ValidatorFn, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { FormPersistenceDirective } from '../../shared/directives/form-persistence.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

// Custom validator for incidentDuration
export function incidentDurationValidator(): ValidatorFn {
  const regex = /^\d{1,3}:(?:[01]\d|2[0-3]):[0-5]\d$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return regex.test(value) ? null : { invalidIncidentDuration: true };
  };
}

// Custom validator for minimum array items
export function minItemsValidator(minItems: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !Array.isArray(control.value)) {
      return null;
    }
    return control.value.length >= minItems ? null : { minItems: { requiredLength: minItems, actualLength: control.value.length } };
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
  { value: 'internal_detection_processes', label: 'Internal detection processes' },
  { value: 'monitoring_by_a_third_party_provider_or_external_entity', label: 'Monitoring by a third-party provider or external entity' },
  { value: 'notification_by_the_third_party_provider_itself', label: 'Notification by the third-party provider itself' },
  { value: 'notification_by_any_other_financial_entity', label: 'Notification by any other financial entity' },
  { value: 'notification_by_a_client', label: 'Notification by a client' },
  { value: 'notification_by_a_counterparty', label: 'Notification by a counterparty' },
  { value: 'notification_by_a_public_authority_other_than_a_competent_authority_or_a_single_point_of_contact', label: 'Notification by a public authority other than a competent authority or a single point of contact' },
  { value: 'notification_by_media_monitoring', label: 'Notification by media monitoring' },
  { value: 'other', label: 'Other' }
];

export const ICT_PROVIDER_TYPES = [ // Placeholder - needs actual schema definition
  { value: 'cloud_provider', label: 'Cloud Provider' },
  { value: 'data_center_provider', label: 'Data Center Provider' },
  { value: 'network_provider', label: 'Network Provider' },
  { value: 'software_provider', label: 'Software Provider' },
  { value: 'other', label: 'Other' }
];

export const INCIDENT_CLASSIFICATION_OPTIONS = [
  { value: 'cybersecurity-related', label: 'Cybersecurity-related' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'system_failure', label: 'System Failure' },
  { value: 'process_failure', label: 'Process Failure' },
  { value: 'other', label: 'Other' }
];

export const CLASSIFICATION_CRITERIA_OPTIONS = [
  { value: 'clients_financial_counterparts_transactions_affected', label: 'Clients, financial counterparts and transactions affected' },
  { value: 'reputational_impact', label: 'Reputational impact' },
  { value: 'duration_and_service_downtime', label: 'Duration and service downtime' },
  { value: 'geographical_spread', label: 'Geographical spread' },
  { value: 'data_losses', label: 'Data losses' },
  { value: 'critical_services_affected', label: 'Critical services affected' },
  { value: 'economic_impact', label: 'Economic impact' }
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

export const EEA_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' }
];

export const INCIDENT_DISCOVERY_SOURCE_OPTIONS = [
  { value: 'it_security', label: 'IT Security' },
  { value: 'staff', label: 'Staff' },
  { value: 'internal_audit', label: 'Internal audit' },
  { value: 'external_audit', label: 'External audit' },
  { value: 'clients', label: 'Clients' },
  { value: 'financial_counterparts', label: 'Financial counterparts' },
  { value: 'third_party_provider', label: 'Third-party provider' },
  { value: 'attacker', label: 'Attacker' },
  { value: 'monitoring_systems', label: 'Monitoring systems' },
  { value: 'authority_agency_law_enforcement_body', label: 'Authority / agency / law enforcement body' },
  { value: 'other', label: 'Other' }
];

export enum ClassificationCriterion {
  CLIENTS_FINANCIAL_COUNTERPARTS_AND_TRANSACTIONS_AFFECTED = 'clients_financial_counterparts_and_transactions_affected',
  GEOGRAPHICAL_SPREAD = 'geographical_spread',
  DATA_LOSSES = 'data_losses',
  CRITICAL_SERVICES_AFFECTED = 'critical_services_affected',
  ECONOMIC_IMPACT = 'economic_impact',
  REPUTATIONAL_IMPACT = 'reputational_impact',
  DURATION_AND_SERVICE_DOWNTIME = 'duration_and_service_downtime'
}

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
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatRadioModule,
    FormPersistenceDirective
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
  incidentDiscoveryOptions = INCIDENT_DISCOVERY_OPTIONS;
  ictProviderTypes = ICT_PROVIDER_TYPES;
  classificationCriteriaOptions = CLASSIFICATION_CRITERIA_OPTIONS;
  eeaCountries = EEA_COUNTRIES;
  incidentDiscoverySourceOptions = INCIDENT_DISCOVERY_SOURCE_OPTIONS;
  classificationCriterionOptions: { value: string; label: string }[] = [];
  ClassificationCriterion = ClassificationCriterion;

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
    // Initialize classification criterion options
    this.classificationCriterionOptions = Object.values(ClassificationCriterion).map(value => ({
      value: value,
      label: this.formatClassificationCriterionLabel(value)
    }));

    this.incidentDetailsForm = this.fb.group({
      financialEntityCode: ['', [Validators.required, Validators.maxLength(32767)]], // 2.1
      detectionDate: [null, Validators.required], // 2.2 (date part)
      detectionTime: [null, Validators.required], // 2.2 (time part)
      classificationDate: [null, Validators.required], // 2.3 (date part)
      classificationTime: [null, Validators.required], // 2.3 (time part)
      incidentDescription: ['', [Validators.required, Validators.maxLength(32767)]], // 2.4
      classificationCriterion: [[], Validators.required], // 2.5 - at least one required
      countryCodeMaterialityThresholds: [[]], // 2.6 - required if geographical_spread
      incidentDiscovery: ['', Validators.required], // 2.7
      originatesFromThirdPartyProvider: [''], // 2.8 - non obligatoire
      isBusinessContinuityActivated: [null, Validators.required], // 2.9
      otherInformation: [''], // 2.10 - non obligatoire
    });

    // Disable ictThirdPartyProviderDetails by default
    this.incidentDetailsForm.get('ictThirdPartyProviderDetails')?.disable();

    this.incidentDetailsForm.get('isIctThirdPartyProviderInvolved')?.valueChanges.subscribe(involved => {
      const detailsGroup = this.incidentDetailsForm.get('ictThirdPartyProviderDetails');
      if (involved) {
        detailsGroup?.enable();
        // Add required validators when enabled
        detailsGroup?.get('ictThirdPartyProviderName')?.setValidators([Validators.required, Validators.maxLength(200)]);
        detailsGroup?.get('ictThirdPartyProviderType')?.setValidators(Validators.required);
        detailsGroup?.get('ictThirdPartyProviderCountry')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{2}$/)]);

      } else {
        detailsGroup?.disable();
        detailsGroup?.reset();
        // Clear validators when disabled
        detailsGroup?.get('ictThirdPartyProviderName')?.clearValidators();
        detailsGroup?.get('ictThirdPartyProviderType')?.clearValidators();
        detailsGroup?.get('ictThirdPartyProviderCountry')?.clearValidators();
      }
      detailsGroup?.get('ictThirdPartyProviderName')?.updateValueAndValidity();
      detailsGroup?.get('ictThirdPartyProviderType')?.updateValueAndValidity();
      detailsGroup?.get('ictThirdPartyProviderCountry')?.updateValueAndValidity();
    });

    // Conditional validator for 2.6 Country Code Materiality Thresholds
    this.incidentDetailsForm.get('classificationCriterion')?.valueChanges.subscribe((criteria: string[]) => {
      const countryCodeControl = this.incidentDetailsForm.get('countryCodeMaterialityThresholds');
      if (criteria && criteria.includes('geographical_spread')) {
        countryCodeControl?.setValidators([Validators.required]);
      } else {
        countryCodeControl?.clearValidators();
      }
      countryCodeControl?.updateValueAndValidity();
    });
  }

  private combineDateAndTime(date: Date | null, time: string | null): string | null {
    if (!date || !time) return null;
    const timeParts = time.split(':');
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);
    const seconds = timeParts.length > 2 ? Number(timeParts[2]) : 0;
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, seconds, 0);
    return combinedDate.toISOString();
  }
  private updateFormValue(): void {
    const formValue = this.incidentDetailsForm.value;
    
    // Combine Detection Date & Time and convert to ISO string
    const detectionDateTime = this.combineDateAndTime(formValue.detectionDate, formValue.detectionTime);
    // Combine Classification Date & Time and convert to ISO string
    const classificationDateTime = this.combineDateAndTime(formValue.classificationDate, formValue.classificationTime);

    // Update the form value with combined date-times as ISO strings
    const updatedValue = {
      ...formValue,
      detectionDateTime, // Now this will be an ISO 8601 string
      classificationDateTime // Now this will be an ISO 8601 string
    };

    this.onChange(updatedValue);
  }

  ngOnInit(): void {
    this.incidentDetailsForm.valueChanges.subscribe(() => {
      this.updateFormValue();
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

  formatClassificationCriterionLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Public method to reset the form to default values
   */
  public resetToDefaults(): void {
    this.incidentDetailsForm.patchValue({
      financialEntityCode: '',
      detectionDate: null,
      detectionTime: null,
      classificationDate: null,
      classificationTime: null,
      incidentDescription: '',
      classificationCriterion: [],
      countryCodeMaterialityThresholds: [],
      incidentDiscovery: '',
      originatesFromThirdPartyProvider: '',
      isBusinessContinuityActivated: null,
      otherInformation: ''
    });
    this.incidentDetailsForm.markAsPristine();
    this.incidentDetailsForm.markAsUntouched();
  }
}
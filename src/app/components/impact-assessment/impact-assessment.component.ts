import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormPersistenceDirective } from '../../shared/directives/form-persistence.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// Custom validator for percentage format
function percentageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const value = control.value.toString();
    // Check if it's a valid number
    if (isNaN(value)) return { invalidPercentage: true };
    
    // Check if it's between 0 and 100
    const numValue = parseFloat(value);
    if (numValue < 0 || numValue > 100) return { invalidPercentage: true };
    
    // Check total numeric characters (including decimal point)
    const numericChars = value.replace(/[^0-9.]/g, '');
    if (numericChars.length > 5) return { tooManyDigits: true };
    
    // Check decimal places
    const parts = value.split('.');
    if (parts.length > 2) return { invalidFormat: true }; // More than one decimal point
    if (parts.length === 2 && parts[1].length > 1) return { tooManyDecimals: true }; // More than 1 decimal place
    
    return null;
  };
}

// Custom validator for transaction value (thousands of units)
function transactionValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const value = control.value.toString();
    // Check if it's a valid number
    if (isNaN(value)) return { invalidValue: true };
    
    // Check if it's non-negative
    const numValue = parseFloat(value);
    if (numValue < 0) return { invalidValue: true };
    
    return null;
  };
}

// Custom validator for DD:HH:MM format
function durationFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const value = control.value.toString();
    // Check DD:HH:MM format with up to 3 digits for days
    const durationRegex = /^(\d{1,3}):([01]\d|2[0-3]):([0-5]\d)$/;
    if (!durationRegex.test(value)) return { invalidDurationFormat: true };
    
    // Check if days is reasonable (0-999)
    const parts = value.split(':');
    const days = parseInt(parts[0]);
    if (days < 0 || days > 999) return { invalidDays: true };
    
    return null;
  };
}

@Component({
  selector: 'app-impact-assessment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    FormPersistenceDirective
  ],
  templateUrl: './impact-assessment.component.html',
  styleUrl: './impact-assessment.component.scss'
})
export class ImpactAssessmentComponent implements OnInit {
  impactForm: FormGroup;

  // Options for Reported Data Status (field 3.12)
  reportedDataStatusOptions = [
    { value: 'actual_figures_for_clients_affected', label: 'Actual figures for clients affected' },
    { value: 'actual_figures_for_financial_counterparts_affected', label: 'Actual figures for financial counterparts affected' },
    { value: 'actual_figures_for_transactions_affected', label: 'Actual figures for transactions affected' },
    { value: 'estimates_for_clients_affected', label: 'Estimates for clients affected' },
    { value: 'estimates_for_financial_counterparts_affected', label: 'Estimates for financial counterparts affected' },
    { value: 'estimates_for_transactions_affected', label: 'Estimates for transactions affected' },
    { value: 'no_impact_on_clients', label: 'No impact on clients' },
    { value: 'no_impact_on_financial_counterparts', label: 'No impact on financial counterparts' },
    { value: 'no_impact_on_transactions', label: 'No impact on transactions' }
  ];

  // Options for Reputational Impact (field 3.13)
  reputationalImpactOptions = [
    { value: 'the_major_ict-related_incident_has_been_reflected_in_the_media', label: 'The major ICT-related incident has been reflected in the media' },
    { value: 'the_major_ict-related_incident_has_resulted_in_repetitive_complaints_from_different_clients_or_financial_counterparts_on_client-facing_services_or_critical_business_relationships', label: 'The major ICT-related incident has resulted in repetitive complaints from different clients or financial counterparts on client-facing services or critical business relationships' },
    { value: 'the_financial_entity_will_not_be_able_to_or_is_likely_not_to_be_able_to_meet_regulatory_requirements_as_a_result_of_the_major_ict-related_incident', label: 'The financial entity will not be able to or is likely not to be able to meet regulatory requirements as a result of the major ICT-related incident' },
    { value: 'the_financial_entity_will_or_is_likely_to_lose_clients_or_financial_counterparts_with_a_material_impact_on_its_business_as_a_result_of_the_major_ict-related_incident', label: 'The financial entity will or is likely to lose clients or financial counterparts with a material impact on its business as a result of the major ICT-related incident' }
  ];

  // Options for Duration and Downtime Information Type (field 3.17)
  durationAndDowntimeInformationTypeOptions = [
    { value: 'actual_figures', label: 'Actual figures' },
    { value: 'estimates', label: 'Estimates' },
    { value: 'actual_figures_and_estimates', label: 'Actual figures and estimates' },
    { value: 'no_information_available', label: 'No information available' }
  ];

  // Options for Types of Impact in Member States (field 3.18)
  typesOfImpactInMemberStatesOptions = [
    { value: 'clients', label: 'Clients' },
    { value: 'financial_counterparts', label: 'Financial counterparts' },
    { value: 'branch_of_financial_entity', label: 'Branch of the financial entity' },
    { value: 'Financial entities within the group carrying out activities in the respective Member State', label: 'Financial entities within the group carrying out activities in the respective Member State' },
    { value: 'Financial market infrastructure', label: 'Financial market infrastructure' },
    { value: 'Third-party providers that may be common to other financial entities', label: 'Third-party providers that may be common to other financial entities' }
  ];

  // Options for Materiality thresholds for data losses (field 3.20)
  materialityThresholdsDataLossesOptions = [
    { value: 'availability', label: 'Availability' },
    { value: 'authenticity', label: 'Authenticity' },
    { value: 'integrity', label: 'Integrity' },
    { value: 'confidentiality', label: 'Confidentiality' }
  ];

  // Options for Type of the major ICT-related incident (field 3.23)
  typeOfMajorICTIncidentOptions = [
    { value: 'cybersecurity_related', label: 'Cybersecurity-related' },
    { value: 'process_failure', label: 'Process failure' },
    { value: 'system_failure', label: 'System failure' },
    { value: 'external_event', label: 'External event' },
    { value: 'payment_related', label: 'Payment-related' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  // Options for Threats and techniques used by the threat actor (field 3.25)
  threatsAndTechniquesUsedByThreatActorOptions = [
    { value: 'social_engineering_including_phishing', label: 'Social engineering (including phishing)' },
    { value: 'ddos', label: '(D)DoS' },
    { value: 'identity_theft', label: 'Identity theft' },
    { value: 'data_encryption_for_impact_including_ransomware', label: 'Data encryption for impact, including ransomware' },
    { value: 'resource_hijacking', label: 'Resource hijacking' },
    { value: 'data_exfiltration_and_manipulation_including_identity_theft', label: 'Data exfiltration and manipulation, including identity theft' },
    { value: 'data_destruction', label: 'Data destruction' },
    { value: 'defacement', label: 'Defacement' },
    { value: 'supply_chain_attack', label: 'Supply-chain attack' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  // Options for Impact on the financial interest of clients (field 3.30)
  impactOnFinancialInterestOfClientsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'information_not_available', label: 'Information not available' }
  ];

  // Options for Reporting to other authorities (field 3.31)
  reportingToOtherAuthoritiesOptions = [
    { value: 'police_law_enforcement', label: 'Police/Law Enforcement' },
    { value: 'csirt', label: 'CSIRT' },
    { value: 'data_protection_authority', label: 'Data Protection Authority' },
    { value: 'national_cybersecurity_agency', label: 'National Cybersecurity Agency' },
    { value: 'none', label: 'None' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  constructor(private fb: FormBuilder) {
    this.impactForm = this.fb.group({
      competentAuthorityCode: ['', Validators.maxLength(32767)], // 3.1
      occurrenceDate: [null], // 3.2 (date part)
      occurrenceTime: [null], // 3.2 (time part)
      recoveryDate: [null], // 3.3 (date part)
      recoveryTime: [null], // 3.3 (time part)
      number: [null, [Validators.min(0), Validators.pattern(/^[0-9]+$/)]], // 3.4
      percentage: [null, [Validators.min(0), Validators.max(100), Validators.pattern(/^[0-9]+$/)]], // 3.5
      numberOfFinancialCounterpartsAffected: [null, [Validators.min(0), Validators.pattern(/^[0-9]+$/)]], // 3.6
      percentageOfFinancialCounterpartsAffected: [null, [Validators.min(0), Validators.max(100), percentageValidator()]], // 3.7
      hasImpactOnRelevantClients: [null], // 3.8
      numberOfAffectedTransactions: [null, [Validators.min(0), Validators.pattern(/^[0-9]+$/)]], // 3.9
      percentageOfAffectedTransactions: [null, [Validators.min(0), Validators.max(100), percentageValidator()]], // 3.10
      valueOfAffectedTransactions: [null, [Validators.min(0), transactionValueValidator()]], // 3.11
      numbersActualEstimate: [[]], // 3.12
      reputationalImpactType: [[]], // 3.13 (conditional)
      reputationalImpactDescription: ['', Validators.maxLength(32767)], // 3.14 (conditional)
      incidentDuration: ['', [durationFormatValidator()]], // 3.15
      serviceDowntime: ['', [durationFormatValidator()]], // 3.16
      informationDurationServiceDowntimeActualOrEstimate: [''], // 3.17 (conditional)
      memberStatesImpactType: [[],], // 3.18 (conditional)
      memberStatesImpactTypeDescription: ['', Validators.maxLength(32767)], // 3.19 (conditional)
      dataLosseMaterialityThresholds: [[],], // 3.20 (conditional)
      dataLossesDescription: ['', Validators.maxLength(32767)], // 3.21 (conditional)
      criticalServicesAffected: ['',], // 3.22
      IncidentType: [[],], // 3.23
      otherIncidentClassification: ['', Validators.maxLength(32767)], // 3.24 (conditional)
      threatTechniques: [[],], // 3.25 (conditional)
      otherThreatTechniques: ['', Validators.maxLength(32767)], // 3.26 (conditional)
      affectedFunctionalAreas: ['',], // 3.27
      isAffectedInfrastructureComponents: ['',], // 3.28
      affectedInfrastructureComponents: ['',], // 3.29
      isImpactOnFinancialInterest: ['',], // 3.30
      reportingToOtherAuthorities: [[],], // 3.31
      reportingToOtherAuthoritiesOther: ['', Validators.maxLength(32767)], // 3.32 (conditional)
      isTemporaryActionsMeasuresForRecovery: [null], // 3.33
      descriptionOfTemporaryActionsMeasuresForRecovery: ['', Validators.maxLength(32767)], // 3.34 (conditional)
      indicatorsOfCompromise: ['', Validators.maxLength(32767)] // 3.35 (conditional)
    });

    // Set up value transformation for percentage fields
    this.impactForm.get('percentage')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        // Ensure integer value
        const intValue = Math.round(parseFloat(value));
        if (intValue !== parseFloat(value)) {
          this.impactForm.get('percentage')?.setValue(intValue, { emitEvent: false });
        }
      }
    });

    // Set up value transformation for financial counterparts percentage field
    this.impactForm.get('percentageOfFinancialCounterpartsAffected')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        // Round to 1 decimal place (half-up)
        const roundedValue = Math.round(parseFloat(value) * 10) / 10;
        if (roundedValue !== parseFloat(value)) {
          this.impactForm.get('percentageOfFinancialCounterpartsAffected')?.setValue(roundedValue, { emitEvent: false });
        }
      }
    });

    // Set up value transformation for affected transactions percentage field
    this.impactForm.get('percentageOfAffectedTransactions')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        // Round to 1 decimal place (half-up)
        const roundedValue = Math.round(parseFloat(value) * 10) / 10;
        if (roundedValue !== parseFloat(value)) {
          this.impactForm.get('percentageOfAffectedTransactions')?.setValue(roundedValue, { emitEvent: false });
        }
      }
    });

    // Set up computed incidentOccurrenceDateTime field
    this.impactForm.get('occurrenceDate')?.valueChanges.subscribe(() => {
      this.updateIncidentOccurrenceDateTime();
    });

    this.impactForm.get('occurrenceTime')?.valueChanges.subscribe(() => {
      this.updateIncidentOccurrenceDateTime();
    });

    // Set up computed serviceRestorationDateTime field
    this.impactForm.get('recoveryDate')?.valueChanges.subscribe(() => {
      this.updateServiceRestorationDateTime();
    });

    this.impactForm.get('recoveryTime')?.valueChanges.subscribe(() => {
      this.updateServiceRestorationDateTime();
    });

    // Add conditional validation for recoveryDate and recoveryTime
    this.impactForm.get('serviceDowntime')?.valueChanges.subscribe(value => {
      this.updateRecoveryDateTimeValidation(value);
    });
  }

  private updateRecoveryDateTimeValidation(serviceDowntimeValue: any): void {
    const recoveryDateControl = this.impactForm.get('recoveryDate');
    const recoveryTimeControl = this.impactForm.get('recoveryTime');
    
    if (serviceDowntimeValue && typeof serviceDowntimeValue === 'string' && serviceDowntimeValue.trim() !== '') {
      // If serviceDowntime is filled, add Validators.required
      recoveryDateControl?.setValidators([Validators.required]);
      recoveryTimeControl?.setValidators([Validators.required]);
    } else {
      // If serviceDowntime is not filled, remove Validators.required
      recoveryDateControl?.clearValidators();
      recoveryTimeControl?.clearValidators();
    }
    
    // Apply validation changes
    recoveryDateControl?.updateValueAndValidity();
    recoveryTimeControl?.updateValueAndValidity();
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

  private updateIncidentOccurrenceDateTime(): void {
    const occurrenceDate = this.impactForm.get('occurrenceDate')?.value;
    const occurrenceTime = this.impactForm.get('occurrenceTime')?.value;
    
    const incidentOccurrenceDateTime = this.combineDateAndTime(occurrenceDate, occurrenceTime);
    
    // Update the form value with the combined date-time
    const currentValue = this.impactForm.value;
    const updatedValue = {
      ...currentValue,
      incidentOccurrenceDateTime
    };
    
    // Emit the updated value if needed
    // Note: This is a computed field, so we don't add it to the form controls
    // but we can access it through a getter or method
  }

  private updateServiceRestorationDateTime(): void {
    const recoveryDate = this.impactForm.get('recoveryDate')?.value;
    const recoveryTime = this.impactForm.get('recoveryTime')?.value;
    
    const serviceRestorationDateTime = this.combineDateAndTime(recoveryDate, recoveryTime);
    
    // Update the form value with the combined date-time
    const currentValue = this.impactForm.value;
    const updatedValue = {
      ...currentValue,
      serviceRestorationDateTime
    };
    
    // Emit the updated value if needed
    // Note: This is a computed field, so we don't add it to the form controls
    // but we can access it through a getter or method
  }

  // Getter for the computed incidentOccurrenceDateTime
  get incidentOccurrenceDateTime(): string | null {
    const occurrenceDate = this.impactForm.get('occurrenceDate')?.value;
    const occurrenceTime = this.impactForm.get('occurrenceTime')?.value;
    return this.combineDateAndTime(occurrenceDate, occurrenceTime);
  }

  // Getter for the computed serviceRestorationDateTime
  get serviceRestorationDateTime(): string | null {
    const recoveryDate = this.impactForm.get('recoveryDate')?.value;
    const recoveryTime = this.impactForm.get('recoveryTime')?.value;
    return this.combineDateAndTime(recoveryDate, recoveryTime);
  }

  ngOnInit(): void {
    // Component initialization
    
    // Apply initial validation state for recoveryDate and recoveryTime
    const serviceDowntimeValue = this.impactForm.get('serviceDowntime')?.value;
    this.updateRecoveryDateTimeValidation(serviceDowntimeValue);
  }
}
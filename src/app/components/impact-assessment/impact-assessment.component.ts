import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
    // Check DD:HH:MM format
    const durationRegex = /^(\d{1,2}):([01]\d|2[0-3]):([0-5]\d)$/;
    if (!durationRegex.test(value)) return { invalidDurationFormat: true };
    
    // Check if days is reasonable (0-99)
    const parts = value.split(':');
    const days = parseInt(parts[0]);
    if (days < 0 || days > 99) return { invalidDays: true };
    
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
    MatSelectModule
  ],
  templateUrl: './impact-assessment.component.html',
  styleUrl: './impact-assessment.component.scss'
})
export class ImpactAssessmentComponent implements OnInit {
  impactForm: FormGroup;

  // Options for Reported Data Status (field 3.12)
  reportedDataStatusOptions = [
    { value: 'actual_figures_clients', label: 'Actual figures for clients affected' },
    { value: 'actual_figures_financial_counterparts', label: 'Actual figures for financial counterparts affected' },
    { value: 'actual_figures_transactions', label: 'Actual figures for transactions affected' },
    { value: 'estimates_clients', label: 'Estimates for clients affected' },
    { value: 'estimates_financial_counterparts', label: 'Estimates for financial counterparts affected' },
    { value: 'estimates_transactions', label: 'Estimates for transactions affected' },
    { value: 'no_impact_clients', label: 'No impact on clients' },
    { value: 'no_impact_financial_counterparts', label: 'No impact on financial counterparts' },
    { value: 'no_impact_transactions', label: 'No impact on transactions' }
  ];

  // Options for Reputational Impact (field 3.13)
  reputationalImpactOptions = [
    { value: 'reflected_in_media', label: 'The major ICT-related incident has been reflected in the media' },
    { value: 'repetitive_complaints', label: 'The major ICT-related incident has resulted in repetitive complaints from different clients or financial counterparts on client-facing services or critical business relationships' },
    { value: 'unable_to_meet_regulatory', label: 'The financial entity will not be able to or is likely not to be able to meet regulatory requirements as a result of the major ICT-related incident' },
    { value: 'likely_to_lose_clients', label: 'The financial entity will or is likely to lose clients or financial counterparts with a material impact on its business as a result of the major ICT-related incident' }
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
    { value: 'financial_entities_within_group', label: 'Financial entities within the group carrying out activities in the respective Member State' },
    { value: 'financial_market_infrastructure', label: 'Financial market infrastructure' },
    { value: 'third_party_providers', label: 'Third-party providers that may be common to other financial entities' }
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
    { value: 'social_engineering_phishing', label: 'Social engineering (including phishing)' },
    { value: 'ddos', label: '(D)DoS' },
    { value: 'identity_theft', label: 'Identity theft' },
    { value: 'data_encryption_ransomware', label: 'Data encryption for impact, including ransomware' },
    { value: 'resource_hijacking', label: 'Resource hijacking' },
    { value: 'data_exfiltration_manipulation', label: 'Data exfiltration and manipulation, including identity theft' },
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
      incidentReferenceCodeProvidedByCompetentAuthority: ['', Validators.maxLength(100)], // field 3.1
      occurrenceDate: [null], // field 3.2 (date part)
      occurrenceTime: [null], // field 3.2 (time part)
      recoveryDate: [null], // field 3.3 (date part)
      recoveryTime: [null], // field 3.3 (time part)
      numberOfClientsAffected: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]], // field 3.4
      percentageOfClientsAffected: [null, [Validators.min(0), Validators.max(100), percentageValidator()]], // field 3.5
      numberOfFinancialCounterpartsAffected: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]], // field 3.6
      percentageOfFinancialCounterpartsAffected: [null, [Validators.min(0), Validators.max(100), percentageValidator()]], // field 3.7
      impactOnRelevantClientsOrFinancialCounterparts: [null], // field 3.8
      numberOfAffectedTransactions: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]], // field 3.9
      percentageOfAffectedTransactions: [null, [Validators.min(0), Validators.max(100), percentageValidator()]], // field 3.10
      valueOfAffectedTransactions: [null, [Validators.min(0), transactionValueValidator()]], // field 3.11
      reportedDataStatus: [[]], // field 3.12
      reputationalImpact: [[]], // field 3.13
      contextualInformationReputationalImpact: ['', Validators.maxLength(1000)], // field 3.14
      durationOfIncident: ['', [durationFormatValidator()]], // field 3.15
      serviceDowntime: ['', [durationFormatValidator()]], // field 3.16
      durationAndDowntimeInformationType: [''], // field 3.17
      typesOfImpactInMemberStates: [[]], // field 3.18
      descriptionOfImpactInOtherMemberStates: ['', Validators.maxLength(1000)], // field 3.19
      materialityThresholdsDataLosses: [[]], // field 3.20
      descriptionOfDataLosses: ['', Validators.maxLength(1000)], // field 3.21
      classificationCriterionCriticalServicesAffected: ['', Validators.maxLength(1000)], // field 3.22
      typeOfMajorICTIncident: [[]], // field 3.23
      otherTypesOfIncidents: ['', Validators.maxLength(1000)], // field 3.24
      threatsAndTechniquesUsedByThreatActor: [[]], // field 3.25
      otherTypesOfTechniques: ['', Validators.maxLength(1000)], // field 3.26
      informationAboutAffectedFunctionalAreas: ['', Validators.maxLength(1000)], // field 3.27
      affectedInfrastructureComponents: ['', Validators.maxLength(1000)], // field 3.28
      informationAboutAffectedInfrastructureComponents: ['', Validators.maxLength(1000)], // field 3.29
      impactOnFinancialInterestOfClients: [''], // field 3.30
      reportingToOtherAuthorities: [[]], // field 3.31
      specificationOfOtherAuthorities: ['', Validators.maxLength(1000)], // field 3.32
      temporaryActionsMeasuresTaken: [null], // field 3.33
      descriptionOfTemporaryActionsMeasures: ['', Validators.maxLength(1000)], // field 3.34
      indicatorsOfCompromise: ['', Validators.maxLength(1000)] // field 3.35
    });

    // Set up value transformation for percentage fields
    this.impactForm.get('percentageOfClientsAffected')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        // Round to 1 decimal place (half-up)
        const roundedValue = Math.round(parseFloat(value) * 10) / 10;
        if (roundedValue !== parseFloat(value)) {
          this.impactForm.get('percentageOfClientsAffected')?.setValue(roundedValue, { emitEvent: false });
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
  }

  ngOnInit(): void {
    // Component initialization
  }
}
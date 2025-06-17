import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-reporting-to-other-authorities',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reporting-to-other-authorities.component.html',
  styleUrl: './reporting-to-other-authorities.component.scss'
})
export class ReportingToOtherAuthoritiesComponent implements OnInit {
  reportingForm: FormGroup;

  // Options for High-level classification of root causes of the incident (field 4.1)
  highLevelClassificationRootCausesOptions = [
    { value: 'malicious_actions', label: 'Malicious actions' },
    { value: 'process_failure', label: 'Process failure' },
    { value: 'system_failure_malfunction', label: 'System failure / malfunction' },
    { value: 'human_error', label: 'Human error' },
    { value: 'external_event', label: 'External event' }
  ];

  // Options for Detailed classification of root causes of the incident (field 4.2)
  detailedClassificationRootCausesOptions = [
    { value: 'malicious_actions_deliberate_internal_actions', label: 'malicious actions: deliberate internal actions' },
    { value: 'malicious_actions_deliberate_physical_damage_manipulation_theft', label: 'malicious actions: deliberate physical damage/manipulation/theft' },
    { value: 'malicious_actions_fraudulent_actions', label: 'malicious actions: fraudulent actions' },
    { value: 'process_failure_insufficient_monitoring_or_failure_of_monitoring_and_control', label: 'process failure: insufficient monitoring or failure of monitoring and control' },
    { value: 'process_failure_insufficient_unclear_roles_and_responsibilities', label: 'process failure: insufficient/unclear roles and responsibilities' },
    { value: 'process_failure_ICT_risk_management_process_failure', label: 'process failure: ICT risk management process failure' },
    { value: 'process_failure_insufficient_or_failure_of_ict_operations_and_ict_security_operations', label: 'process failure: insufficient or failure of ICT operations and ICT security operations' },
    { value: 'process_failure_insufficient_or_failure_of_ict_project_management', label: 'process failure: insufficient or failure of ICT project management' },
    { value: 'process_failure_inadequacy_of_internal_policies_procedures_and_documentation', label: 'process failure: inadequacy of internal policies, procedures and documentation' },
    { value: 'process_failure_inadequate_ict_systems_acquisition_development_and_maintenance', label: 'Process failure: inadequate ICT systems acquisition, development, and maintenance' },
    { value: 'process_failure_other', label: 'process failure: other (please specify)' },
    { value: 'system_failure_hardware_capacity_and_performance', label: 'system failure: hardware capacity and performance' },
    { value: 'system_failure_hardware_maintenance', label: 'system failure: hardware maintenance' },
    { value: 'system_failure_hardware_obsolescence_ageing', label: 'system failure: hardware obsolescence/ageing' },
    { value: 'system_failure_software_compatibility_configuration', label: 'system failure: software compatibility/configuration' },
    { value: 'system_failure_software_performance', label: 'system failure: software performance' },
    { value: 'system_failure_network_configuration', label: 'system failure: network configuration' },
    { value: 'system_failure_physical_damage', label: 'system failure: physical damage' },
    { value: 'system_failure_other', label: 'system failure: other (please specify)' },
    { value: 'human_error_omission', label: 'human error: omission' },
    { value: 'human_error_mistake', label: 'human error: mistake' },
    { value: 'human_error_skills_knowledge', label: 'human error: skills & knowledge' },
    { value: 'human_error_inadequate_human_resources', label: 'human error: inadequate human resources' },
    { value: 'human_error_miscommunication', label: 'human error miscommunication' },
    { value: 'human_error_other', label: 'human error: other (please specify)' },
    { value: 'external_event_natural_disasters_force_majeure', label: 'external event: natural disasters/force majeure' },
    { value: 'external_event_third-party_failures', label: 'external event: third-party failures' },
    { value: 'external_event_other', label: 'external event: other (please specify)' }
  ];
  

  // Options for Additional classification of root causes of the incident (field 4.3)
  additionalClassificationRootCausesOptions = [
    { value: 'monitoring_policy_adherence', label: 'monitoring of policy adherence' },
    { value: 'monitoring_of_third-party_service_providers', label: 'monitoring of third-party service providers' },
    { value: 'monitoring_and_verification_of_remediation_of_vulnerabilities', label: 'monitoring and verification of remediation of vulnerabilities' },
    { value: 'identity_and_access_management', label: 'identity and access management' },
    { value: 'encryption_and_cryptography', label: 'encryption and cryptography' },
    { value: 'logging', label: 'logging' },
    { value: 'failure_in_specifying_accurate_risk_tolerance_levels', label: 'failure in specifying accurate risk tolerance levels' },
    { value: 'insufficient_vulnerability_and_threat_assessments', label: 'insufficient vulnerability and threat assessments' },
    { value: 'inadequate_risk_treatment_measures', label: 'inadequate risk treatment measures' },
    { value: 'poor_management_of_residual_ict_risks', label: 'poor management of residual ICT risks' },
    { value: 'vulnerability_and_patch_management', label: 'vulnerability and patch management' },
    { value: 'change_management', label: 'change management' },
    { value: 'capacity_and_performance_management', label: 'capacity and performance management' },
    { value: 'ict_asset_management_and_information_classification', label: 'ICT asset management and information classification' },
    { value: 'backup_and_restore', label: 'backup and restore' },
    { value: 'error_handling', label: 'error handling' },
    { value: 'inadequate_ict_systems_acquisition_development_and_maintenance', label: 'inadequate ICT systems acquisition, development, and maintenance' },
    { value: 'insufficient_or_failure_of_software_testing', label: 'insufficient or failure of software testing' }
  ];

  constructor(private fb: FormBuilder) {
    this.reportingForm = this.fb.group({
      rootCauseHLClassification: [[]], // field 4.1
      rootCausesDetailedClassification: [[]], // field 4.2
      rootCausesAdditionalClassification: [[]], // field 4.3
      rootCausesOther: ['', Validators.maxLength(32767)], // field 4.4
      rootCausesInformation: ['', Validators.maxLength(32767)], // field 4.5
      incidentResolutionSummary: ['', Validators.maxLength(32767)], // field 4.6
      incidentRootCauseAddressedDate: [null], // field 4.7 (date part)
      incidentRootCauseAddressedTime: [null], // field 4.7 (time part)
      rootCauseAddressingDateTime: [''], // field 4.7 (combined date-time)
      incidentWasResolvedDate: [null], // field 4.8 (date part)
      incidentWasResolvedTime: [null], // field 4.8 (time part)
      incidentResolutionDateTime: [''], // field 4.8 (combined date-time)
      incidentResolutionVsPlannedImplementation: ['', Validators.maxLength(32767)], // field 4.9
      assessmentOfRiskToCriticalFunctions: ['', Validators.maxLength(32767)], // field 4.10
      informationRelevantToResolutionAuthorities: ['', Validators.maxLength(32767)], // field 4.11
      economicImpactMaterialityThreshold: [''], // field 4.12
      grossAmountIndirectDirectCosts: [null, [Validators.min(0), this.transactionValueValidator()]], // field 4.13
      financialRecoveriesAmount: [null, [Validators.min(0), this.transactionValueValidator()]], // field 4.14
      recurringNonMajorIncidentsDescription: ['', Validators.maxLength(32767)], // field 4.15
      occurrenceOfRecurringIncidentsDate: [null], // field 4.16 (date part)
      occurrenceOfRecurringIncidentsTime: [null], // field 4.16 (time part)
      recurringIncidentsOccurrenceDateTime: [''], // field 4.16 (combined date-time)
    });

    // Set up value change subscriptions for date-time combination
    this.reportingForm.get('incidentRootCauseAddressedDate')?.valueChanges.subscribe(() => {
      this.updateRootCauseAddressingDateTime();
    });

    this.reportingForm.get('incidentRootCauseAddressedTime')?.valueChanges.subscribe(() => {
      this.updateRootCauseAddressingDateTime();
    });

    // Set up value change subscriptions for incident resolution date-time combination
    this.reportingForm.get('incidentWasResolvedDate')?.valueChanges.subscribe(() => {
      this.updateIncidentResolutionDateTime();
    });

    this.reportingForm.get('incidentWasResolvedTime')?.valueChanges.subscribe(() => {
      this.updateIncidentResolutionDateTime();
    });

    // Set up value change subscriptions for recurring incidents occurrence date-time combination
    this.reportingForm.get('occurrenceOfRecurringIncidentsDate')?.valueChanges.subscribe(() => {
      this.updateRecurringIncidentsOccurrenceDateTime();
    });

    this.reportingForm.get('occurrenceOfRecurringIncidentsTime')?.valueChanges.subscribe(() => {
      this.updateRecurringIncidentsOccurrenceDateTime();
    });
  }

  ngOnInit(): void {
  }

  // Custom validator for monetary values (thousands of units)
  private transactionValueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return { invalidValue: true };
      }
      
      // Check if the value is in thousands (minimum precision)
      if (numValue < 0.001) {
        return { invalidValue: true };
      }
      
      return null;
    };
  }

  private combineDateAndTime(date: Date | null, time: string | null): string | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    return combinedDate.toISOString();
  }

  private updateRootCauseAddressingDateTime(): void {
    const date = this.reportingForm.get('incidentRootCauseAddressedDate')?.value;
    const time = this.reportingForm.get('incidentRootCauseAddressedTime')?.value;
    
    const rootCauseAddressingDateTime = this.combineDateAndTime(date, time);
    
    this.reportingForm.get('rootCauseAddressingDateTime')?.setValue(rootCauseAddressingDateTime, { emitEvent: false });
  }

  // Getter for the computed rootCauseAddressingDateTime
  get rootCauseAddressingDateTime(): string | null {
    const date = this.reportingForm.get('incidentRootCauseAddressedDate')?.value;
    const time = this.reportingForm.get('incidentRootCauseAddressedTime')?.value;
    return this.combineDateAndTime(date, time);
  }

  private updateIncidentResolutionDateTime(): void {
    const date = this.reportingForm.get('incidentWasResolvedDate')?.value;
    const time = this.reportingForm.get('incidentWasResolvedTime')?.value;
    
    const incidentResolutionDateTime = this.combineDateAndTime(date, time);
    
    this.reportingForm.get('incidentResolutionDateTime')?.setValue(incidentResolutionDateTime, { emitEvent: false });
  }

  // Getter for the computed incidentResolutionDateTime
  get incidentResolutionDateTime(): string | null {
    const date = this.reportingForm.get('incidentWasResolvedDate')?.value;
    const time = this.reportingForm.get('incidentWasResolvedTime')?.value;
    return this.combineDateAndTime(date, time);
  }

  private updateRecurringIncidentsOccurrenceDateTime(): void {
    const date = this.reportingForm.get('occurrenceOfRecurringIncidentsDate')?.value;
    const time = this.reportingForm.get('occurrenceOfRecurringIncidentsTime')?.value;
    
    const recurringIncidentsOccurrenceDateTime = this.combineDateAndTime(date, time);
    
    this.reportingForm.get('recurringIncidentsOccurrenceDateTime')?.setValue(recurringIncidentsOccurrenceDateTime, { emitEvent: false });
  }

  // Getter for the computed recurringIncidentsOccurrenceDateTime
  get recurringIncidentsOccurrenceDateTime(): string | null {
    const date = this.reportingForm.get('occurrenceOfRecurringIncidentsDate')?.value;
    const time = this.reportingForm.get('occurrenceOfRecurringIncidentsTime')?.value;
    return this.combineDateAndTime(date, time);
  }
} 
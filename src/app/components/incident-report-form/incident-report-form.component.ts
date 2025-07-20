import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IncidentDetailsFormComponent } from '../incident-details-form/incident-details-form.component';
import { ImpactAssessmentComponent } from '../impact-assessment/impact-assessment.component';
import { ReportingToOtherAuthoritiesComponent } from '../reporting-to-other-authorities/reporting-to-other-authorities.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormPersistenceService } from '../../core/services/form-persistence.service';
import { FormPersistenceDirective } from '../../shared/directives/form-persistence.directive';
import { MatIconModule } from '@angular/material/icon';

export enum IncidentSubmissionType {
  INITIAL_NOTIFICATION = 'initial_notification',
  INTERMEDIATE_REPORT = 'intermediate_report',
  FINAL_REPORT = 'final_report',
  MAJOR_INCIDENT_RECLASSIFIED = 'major_incident_reclassified_as_non-major'
}

const REPORT_CURRENCIES = [
  "EUR",
  "BGN",
  "CZK",
  "DKK",
  "HUF",
  "PLN",
  "RON",
  "ISK",
  "CHF",
  "NOK",
  "SEK"
];

export enum AffectedEntityType {
  CREDIT_INSTITUTION = 'credit_institution',
  PAYMENT_INSTITUTION = 'payment_institution',
  EXEMPTED_PAYMENT_INSTITUTION = 'exempted_payment_institution',
  ACCOUNT_INFORMATION_SERVICE_PROVIDER = 'account_information_service_provider',
  ELECTRONIC_MONEY_INSTITUTION = 'electronic_money_institution',
  EXEMPTED_ELECTRONIC_MONEY_INSTITUTION = 'exempted_electronic_money_institution',
  INVESTMENT_FIRM = 'investment_firm',
  CRYPTO_ASSET_SERVICE_PROVIDER = 'crypto-asset_service_provider',
  ISSUER_OF_ASSET_REFERENCED_TOKENS = 'issuer_of_asset-referenced_tokens',
  CENTRAL_SECURITIES_DEPOSITORY = 'central_securities_depository',
  CENTRAL_COUNTERPARTY = 'central_counterparty',
  TRADING_VENUE = 'trading_venue',
  TRADE_REPOSITORY = 'trade_repository',
  MANAGER_OF_ALTERNATIVE_INVESTMENT_FUND = 'manager_of_alternative_investment_fund',
  MANAGEMENT_COMPANY = 'management_company',
  DATA_REPORTING_SERVICE_PROVIDER = 'data_reporting_service_provider',
  INSURANCE_AND_REINSURANCE_UNDERTAKING = 'insurance_and_reinsurance_undertaking',
  INSURANCE_INTERMEDIARY_REINSURANCE_INTERMEDIARY_AND_ANCILLARY_INSURANCE_INTERMEDIARY = 'insurance_intermediary_reinsurance_intermediary_and_ancillary_insurance_intermediary',
  INSTITUTION_FOR_OCCUPATIONAL_RETIREMENT_PROVISION = 'institution_for_occupational_retirement_provision',
  CREDIT_RATING_AGENCY = 'credit_rating_agency',
  ADMINISTRATOR_OF_CRITICAL_BENCHMARKS = 'administrator_of_critical_benchmarks',
  CROWDFUNDING_SERVICE_PROVIDER = 'crowdfunding_service_provider',
  SECURITISATION_REPOSITORY = 'securitisation_repository'
}

interface IncidentFormData {
  // Incident Submission Details
  submissionDate: Date;
  reporterName: string;
  reporterRole: string;

  // Entity Information
  entityName: string;
  entityType: string;
  entityLocation: string;

  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Incident Details
  incidentTitle: string;
  incidentDate: Date;
  incidentDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Impact Assessment
  financialImpact: number;
  operationalImpact: string;
  customerImpact: string;

  // Reporting to Other Authorities
  reportedToAuthorities: boolean;
  authorityName: string;
  reportReference: string;
}

const PHONE_REGEX = /^\+?[1-9]\d{1,14}(\s?\(\d+\))?([-\s.]?\d+)*$/;

@Component({
  selector: 'app-incident-report-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    IncidentDetailsFormComponent,
    ImpactAssessmentComponent,
    ReportingToOtherAuthoritiesComponent,
    FormPersistenceDirective
  ],
  templateUrl: './incident-report-form.component.html',
  styleUrl: './incident-report-form.component.scss'
})
export class IncidentReportFormComponent implements OnInit, OnDestroy, AfterViewInit {
  incidentForm: FormGroup;
  incidentSubmissionTypes = Object.values(IncidentSubmissionType);
  reportCurrencies = REPORT_CURRENCIES;
  affectedEntityTypeOptions: { value: string; label: string }[] = [];
  private destroy$ = new Subject<void>();
  formSubmitted = false;
  IncidentSubmissionType = IncidentSubmissionType;
  AffectedEntityType = AffectedEntityType;
  
  // Form persistence
  private formPersistence: ReturnType<FormPersistenceService['registerForm']> | null = null;
  isSaving = false;
  
  @ViewChild(IncidentDetailsFormComponent) incidentDetailsFormComponent!: IncidentDetailsFormComponent;
  @ViewChild(ImpactAssessmentComponent) impactAssessmentComponent!: ImpactAssessmentComponent;
  @ViewChild(ReportingToOtherAuthoritiesComponent) reportingToOtherAuthoritiesComponent!: ReportingToOtherAuthoritiesComponent;

  // Custom validator to ensure at least one of code or LEI is filled
  static codeOrLeiRequiredValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const code = group.get('code')?.value;
    const lei = group.get('LEI')?.value;
    if (!code && !lei) {
      return { codeOrLeiRequired: true };
    }
    return null;
  };

  // Custom validator to ensure LEI is filled for Ultimate Parent Undertaking
  static leiRequiredValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const lei = group.get('LEI')?.value;
    if (!lei) {
      return { leiRequired: true };
    }
    return null;
  };

  constructor(
    private fb: FormBuilder,
    private formPersistenceService: FormPersistenceService
  ) {
    // Initialize affected entity type options
    this.affectedEntityTypeOptions = Object.values(AffectedEntityType).map(value => ({
      value: value,
      label: this.formatAffectedEntityTypeLabel(value)
    }));

    this.incidentForm = this.fb.group({
      incidentSubmissionDetails: this.fb.group({
        incidentSubmission: ['', Validators.required],
        reportCurrency: ['EUR', Validators.required]
      }),
      // --- Entity Information ---
      submittingEntity: this.fb.group({
        name: ['ENGIE GLOBAL MARKETS', [Validators.required, Validators.maxLength(32767)]],
        code: ['', Validators.maxLength(32767)],
        LEI: ['5493003C3KJ2TY7MBZ44', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
        entityType: ['SUBMITTING_ENTITY']
      }, { validators: IncidentReportFormComponent.codeOrLeiRequiredValidator }),
      affectedEntity: this.fb.array([
        this.fb.group({
          name: [''],
          LEI: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
          affectedEntityType: [['investment_firm']], // default value set here
          entityType: ['AFFECTED_ENTITY']
        })
      ]),
      ultimateParentUndertaking: this.fb.group({
        name: ['ENGIE', [Validators.maxLength(32767)]],
        LEI: ['LAXUQCHT4FH58LRZDY46', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
        entityType: ['ULTIMATE_PARENT_UNDERTAKING_ENTITY']
      }),
      // --- End Entity Information ---
      // --- Contact Information ---
      primaryContact: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(32767)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(PHONE_REGEX)]]
      }),
      secondaryContact: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(32767)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(PHONE_REGEX)]]
      }),
      // --- End Contact Information ---
      // --- Incident Details ---
      incidentDetails: this.fb.control(null),
      // --- End Incident Details ---
      entityName: ['', Validators.required],
      entityType: ['', Validators.required],
      entityLocation: ['', Validators.required],
      contactName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^[0-9-+()]*$')]],
      // Remove old incident details fields here
      // incidentTitle, incidentDate, incidentDescription, severity, etc. are removed
      incidentTitle: undefined,
      incidentDate: undefined,
      incidentDescription: undefined,
      severity: undefined,
      reportedToAuthorities: [false],
      authorityName: [''],
      reportReference: ['']
    });

    // Conditional validation for authority fields
    this.incidentForm.get('reportedToAuthorities')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(reported => {
        const authorityNameControl = this.incidentForm.get('authorityName');
        const reportReferenceControl = this.incidentForm.get('reportReference');
        
        if (reported) {
          authorityNameControl?.setValidators([Validators.required]);
          reportReferenceControl?.setValidators([Validators.required]);
        } else {
          authorityNameControl?.clearValidators();
          reportReferenceControl?.clearValidators();
        }
        
        authorityNameControl?.updateValueAndValidity();
        reportReferenceControl?.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    // Initialize form persistence
    this.formPersistence = this.formPersistenceService.registerForm(
      'incident-report-form',
      this.incidentForm,
      {
        autoSave: true,
        excludeFields: ['password', 'confirmPassword'], // Exclude sensitive fields
        expiryHours: 48 // Keep data for 48 hours
      }
    );
    
    // Listen to form changes to trigger tab label updates
    this.incidentForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Trigger change detection for tab labels
        // This ensures the warning icon appears/disappears as needed
      });
    
    this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.valueChanges.subscribe((type: string) => {
      const impactForm = this.impactAssessmentComponent?.impactForm;
      const reportingForm = this.reportingToOtherAuthoritiesComponent?.reportingForm;
      const incidentDetailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
      
      // Handle Major Incident Reclassified as Non-Major - only specific fields required
      if (type === 'major_incident_reclassified_as_non-major') {
        this.handleMajorIncidentReclassifiedValidation();
        return;
      } else {
        // Restore normal validators for other incident types
        this.restoreNormalValidators();
      }
      
      if (!impactForm) return;
      const requiredFields = [
        'competentAuthorityCode', 'occurrenceDate', 'occurrenceTime', 'recoveryDate', 'recoveryTime',
        'number', 'percentage', 'numberOfFinancialCounterpartsAffected', 'percentageOfFinancialCounterpartsAffected',
        'hasImpactOnRelevantClients', 'numberOfAffectedTransactions', 'percentageOfAffectedTransactions',
        'valueOfAffectedTransactions', 'numbersActualEstimate', 'criticalServicesAffected', 'IncidentType',
        'affectedFunctionalAreas', 'isAffectedInfrastructureComponents', 'affectedInfrastructureComponents',
        'isImpactOnFinancialInterest', 'reportingToOtherAuthorities', 'isTemporaryActionsMeasuresForRecovery'
      ];
      requiredFields.forEach(field => {
        const control = impactForm.get(field);
        if (!control) return;
        if (type === 'intermediate_report' || type === 'final_report') {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      });

      // --- Added for fields required only for final_report (section 4) ---
      if (reportingForm) {
        const section4Fields = [
          'rootCauseHLClassification',
          'rootCausesDetailedClassification',
          'rootCausesAdditionalClassification',
          'rootCausesInformation',
          'incidentResolutionSummary',
          'incidentRootCauseAddressedDate',
          'incidentRootCauseAddressedTime',
          'incidentWasResolvedDate',
          'incidentWasResolvedTime',
          'incidentResolutionVsPlannedImplementation',
          'assessmentOfRiskToCriticalFunctions',
          'informationRelevantToResolutionAuthorities',
          'economicImpactMaterialityThreshold',
          'grossAmountIndirectDirectCosts',
          'financialRecoveriesAmount',
          'recurringNonMajorIncidentsDescription',
          'occurrenceOfRecurringIncidentsDate',
          'recurringIncidentDate',
        ];
        section4Fields.forEach(field => {
          const control = reportingForm.get(field);
          if (!control) return;
          if (type === 'final_report') {
            control.setValidators([Validators.required]);
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity();
        });
        // Handling of the rootCausesOther field which depends on a value in rootCausesDetailedClassification
        const detailed = reportingForm.get('rootCausesDetailedClassification')?.value || [];
        const requireOther = Array.isArray(detailed) && detailed.some((val: string) => [
          'process_failure_other',
          'system_failure_other',
          'human_error_other',
          'external_event_other'
        ].includes(val));
        const otherControl = reportingForm.get('rootCausesOther');
        if (otherControl) {
          if (type === 'final_report' && requireOther) {
            otherControl.setValidators([Validators.required]);
          } else {
            otherControl.clearValidators();
          }
          otherControl.updateValueAndValidity();
        }
      }
    });

    this.incidentForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Form value changed:', value);
      });
  }

  ngAfterViewInit(): void {
    const incidentSubmissionControl = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission');

    const toggleControls = (enable: boolean) => {
      const reportCurrencyControl = this.incidentForm.get('incidentSubmissionDetails.reportCurrency');
      if (enable) {
        reportCurrencyControl?.enable({ emitEvent: false });
      } else {
        reportCurrencyControl?.disable({ emitEvent: false });
      }

      Object.keys(this.incidentForm.controls).forEach(key => {
        if (key !== 'incidentSubmissionDetails') {
          const control = this.incidentForm.get(key);
          if (enable) {
            control?.enable({ emitEvent: false });
          } else {
            control?.disable({ emitEvent: false });
          }
        }
      });

      if (this.incidentDetailsFormComponent?.incidentDetailsForm) {
        enable ? this.incidentDetailsFormComponent.incidentDetailsForm.enable({ emitEvent: false }) : this.incidentDetailsFormComponent.incidentDetailsForm.disable({ emitEvent: false });
      }
      if (this.impactAssessmentComponent?.impactForm) {
        enable ? this.impactAssessmentComponent.impactForm.enable({ emitEvent: false }) : this.impactAssessmentComponent.impactForm.disable({ emitEvent: false });
      }
      if (this.reportingToOtherAuthoritiesComponent?.reportingForm) {
        enable ? this.reportingToOtherAuthoritiesComponent.reportingForm.enable({ emitEvent: false }) : this.reportingToOtherAuthoritiesComponent.reportingForm.disable({ emitEvent: false });
      }
    };

    toggleControls(!!incidentSubmissionControl?.value);

    incidentSubmissionControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        toggleControls(!!value);
      });

    const detailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
    const impactFormLocal = this.impactAssessmentComponent?.impactForm;
    const reportingFormLocal = this.reportingToOtherAuthoritiesComponent?.reportingForm;

    if (detailsForm && impactFormLocal) {
      detailsForm.get('classificationCriterion')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((criteria: string[]) => {
          const reputationalImpactControl = impactFormLocal.get('reputationalImpactType');
          const reputationalImpactDescriptionControl = impactFormLocal.get('reputationalImpactDescription');
          if (criteria && criteria.includes('reputational_impact')) {
            reputationalImpactControl?.setValidators([Validators.required]);
            reputationalImpactDescriptionControl?.setValidators([Validators.required]);
          } else {
            reputationalImpactControl?.clearValidators();
            reputationalImpactDescriptionControl?.clearValidators();
          }
          reputationalImpactControl?.updateValueAndValidity();
          reputationalImpactDescriptionControl?.updateValueAndValidity();

          const durationDowntimeControl = impactFormLocal.get('informationDurationServiceDowntimeActualOrEstimate');
          if (criteria && criteria.includes('duration_and_service_downtime')) {
            durationDowntimeControl?.setValidators([Validators.required]);
          } else {
            durationDowntimeControl?.clearValidators();
          }
          durationDowntimeControl?.updateValueAndValidity();

          const memberStatesImpactTypeControl = impactFormLocal.get('memberStatesImpactType');
          const memberStatesImpactTypeDescriptionControl = impactFormLocal.get('memberStatesImpactTypeDescription');
          if (criteria && criteria.includes('geographical_spread')) {
            memberStatesImpactTypeControl?.setValidators([Validators.required]);
            memberStatesImpactTypeDescriptionControl?.setValidators([Validators.required]);
          } else {
            memberStatesImpactTypeControl?.clearValidators();
            memberStatesImpactTypeDescriptionControl?.clearValidators();
          }
          memberStatesImpactTypeControl?.updateValueAndValidity();
          memberStatesImpactTypeDescriptionControl?.updateValueAndValidity();

          const dataLossesControl = impactFormLocal.get('dataLosseMaterialityThresholds');
          const dataLossesDescriptionControl = impactFormLocal.get('dataLossesDescription');
          if (criteria && criteria.includes('data_losses')) {
            dataLossesControl?.setValidators([Validators.required]);
            dataLossesDescriptionControl?.setValidators([Validators.required]);
          } else {
            dataLossesControl?.clearValidators();
            dataLossesDescriptionControl?.clearValidators();
          }
          dataLossesControl?.updateValueAndValidity();
          dataLossesDescriptionControl?.updateValueAndValidity();
        });

      impactFormLocal.get('IncidentType')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((incidentTypes: string[]) => {
          const otherClassificationControl = impactFormLocal.get('otherIncidentClassification');
          if (incidentTypes && incidentTypes.includes('other')) {
            otherClassificationControl?.setValidators([Validators.required]);
          } else {
            otherClassificationControl?.clearValidators();
          }
          otherClassificationControl?.updateValueAndValidity();

          const threatTechniquesControl = impactFormLocal.get('threatTechniques');
          const indicatorsOfCompromiseControl = impactFormLocal.get('indicatorsOfCompromise');
          if (incidentTypes && incidentTypes.includes('cybersecurity_related')) {
            threatTechniquesControl?.setValidators([Validators.required]);
            indicatorsOfCompromiseControl?.setValidators([Validators.required]);
          } else {
            threatTechniquesControl?.clearValidators();
            indicatorsOfCompromiseControl?.clearValidators();
          }
          threatTechniquesControl?.updateValueAndValidity();
          indicatorsOfCompromiseControl?.updateValueAndValidity();
        });

      impactFormLocal.get('threatTechniques')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((threats: string[]) => {
          const otherThreatsControl = impactFormLocal.get('otherThreatTechniques');
          if (threats && threats.includes('other')) {
            otherThreatsControl?.setValidators([Validators.required]);
          } else {
            otherThreatsControl?.clearValidators();
          }
          otherThreatsControl?.updateValueAndValidity();
        });

      impactFormLocal.get('reportingToOtherAuthorities')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((authorities: string[]) => {
          const otherAuthoritiesControl = impactFormLocal.get('reportingToOtherAuthoritiesOther');
          if (authorities && authorities.includes('other')) {
            otherAuthoritiesControl?.setValidators([Validators.required]);
          } else {
            otherAuthoritiesControl?.clearValidators();
          }
          otherAuthoritiesControl?.updateValueAndValidity();
        });

      impactFormLocal.get('isTemporaryActionsMeasuresForRecovery')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((isTemporary: boolean) => {
          const descriptionControl = impactFormLocal.get('descriptionOfTemporaryActionsMeasuresForRecovery');
          if (isTemporary === true) {
            descriptionControl?.setValidators([Validators.required]);
          } else {
            descriptionControl?.clearValidators();
          }
          descriptionControl?.updateValueAndValidity();
        });
    }

    if (reportingFormLocal) {
      reportingFormLocal.get('rootCausesDetailedClassification')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((detailed: string[]) => {
          const otherRootCauseControl = reportingFormLocal.get('rootCausesOther');
          const requiredValues = [
            'process_failure_other',
            'system_failure_other',
            'human_error_other',
            'external_event_other'
          ];
          if (detailed && detailed.some(val => requiredValues.includes(val))) {
            otherRootCauseControl?.setValidators([Validators.required]);
          } else {
            otherRootCauseControl?.clearValidators();
          }
          otherRootCauseControl?.updateValueAndValidity();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Deletes all saved data for the form and its sub-forms
   */
  clearAllSavedData(): void {
    this.showConfirmationDialog(
      'Delete saved data',
      'Are you sure you want to delete all saved data for this form?',
      'This action is irreversible and will erase all previously filled fields.',
      () => {
        try {
          console.log('Starting to clear all saved data...');
          
          // Clear specific form data
          this.formPersistenceService.clearFormData('incident-report-form');
          this.formPersistenceService.clearFormData('incident-details');
          this.formPersistenceService.clearFormData('impact-assessment');
          this.formPersistenceService.clearFormData('reporting-authorities');
          
          // Also use the clearAllFormData method as a fallback
          this.formPersistenceService.clearAllFormData();
          
          console.log('Form data cleared from localStorage');
          
          // Reset the main form
          this.initializeFormWithDefaults();
          
          // Reset child components
          this.resetChildComponents();
          
          console.log('Saved data successfully deleted');
          this.showTemporaryNotification('All saved data has been deleted', 'success');
        } catch (error) {
          console.error('Error clearing saved data:', error);
          this.showTemporaryNotification('Error occurred while clearing data', 'error');
        }
      }
    );
  }

  /**
   * Checks if any saved data exists for this form or its sub-forms
   */
  hasFormData(): boolean {
    return this.formPersistenceService.hasFormData('incident-report-form') ||
           this.formPersistenceService.hasFormData('incident-details') ||
           this.formPersistenceService.hasFormData('impact-assessment') ||
           this.formPersistenceService.hasFormData('reporting-authorities');
  }

  /**
   * Resets the main form to its default values
   */
  private initializeFormWithDefaults(): void {
    // Reset the entire form to default values
    this.incidentForm.patchValue({
      incidentSubmissionDetails: {
        incidentSubmission: '',
        reportCurrency: 'EUR'
      },
      submittingEntity: {
        name: 'ENGIE GLOBAL MARKETS',
        code: '',
        LEI: '5493003C3KJ2TY7MBZ44',
        entityType: 'SUBMITTING_ENTITY'
      },
      ultimateParentUndertaking: {
        name: 'ENGIE',
        LEI: 'LAXUQCHT4FH58LRZDY46',
        entityType: 'ULTIMATE_PARENT_UNDERTAKING_ENTITY'
      },
      primaryContact: {
        name: '',
        email: '',
        phone: ''
      },
      secondaryContact: {
        name: '',
        email: '',
        phone: ''
      },
      incidentDetails: null,
      entityName: '',
      entityType: '',
      entityLocation: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      reportedToAuthorities: false,
      authorityName: '',
      reportReference: ''
    });

    // Reset affected entities array - keep only one with default values
    while (this.affectedEntity.length > 1) {
      this.affectedEntity.removeAt(this.affectedEntity.length - 1);
    }
    
    // Reset the first affected entity to default values
    this.affectedEntity.at(0)?.patchValue({
      name: '',
      LEI: '',
      affectedEntityType: ['investment_firm'],
      entityType: 'AFFECTED_ENTITY'
    });
    
    // Mark the form as pristine
    this.incidentForm.markAsPristine();
    this.incidentForm.markAsUntouched();
    
    console.log('Main form reset to default values');
  }

  /**
   * Resets the child components' forms to their default values
   */
  private resetChildComponents(): void {
    setTimeout(() => {
      // Reset Incident Details form to default values
      if (this.incidentDetailsFormComponent) {
        this.incidentDetailsFormComponent.resetToDefaults();
        console.log('Incident Details form reset to default values');
      } else {
        console.warn('Incident Details component not available for reset');
      }
      
      // Reset Impact Assessment form to default values
      if (this.impactAssessmentComponent?.impactForm) {
        this.impactAssessmentComponent.impactForm.reset();
        this.impactAssessmentComponent.impactForm.markAsPristine();
        this.impactAssessmentComponent.impactForm.markAsUntouched();
        console.log('Impact Assessment form reset to default values');
      } else {
        console.warn('Impact Assessment component not available for reset');
      }
      
      // Reset Reporting to Other Authorities form to default values
      if (this.reportingToOtherAuthoritiesComponent?.reportingForm) {
        this.reportingToOtherAuthoritiesComponent.reportingForm.reset();
        this.reportingToOtherAuthoritiesComponent.reportingForm.markAsPristine();
        this.reportingToOtherAuthoritiesComponent.reportingForm.markAsUntouched();
        console.log('Reporting to Other Authorities form reset to default values');
      } else {
        console.warn('Reporting to Other Authorities component not available for reset');
      }
    }, 100);
  }

  /**
   * Displays a custom confirmation dialog box
   */
  private showConfirmationDialog(
    title: string,
    message: string,
    details: string,
    onConfirm: () => void
  ): void {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(2px);
    `;

    // Create the popup
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      border-radius: 4px;
      padding: 24px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: popupSlideIn 0.3s ease-out;
      font-family: 'Roboto', sans-serif;
    `;

    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes popupSlideIn {
        from {
          transform: scale(0.7) translateY(-20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      .confirm-btn {
        background: #f44336;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s ease;
      }
      .confirm-btn:hover {
        background: #d32f2f;
      }
      .cancel-btn {
        background: #e0e0e0;
        color: #424242;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-right: 12px;
        transition: background 0.2s ease;
      }
      .cancel-btn:hover {
        background: #d5d5d5;
      }
    `;
    document.head.appendChild(style);

    // Contenu de la popup
    popup.innerHTML = `
      <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
        <div style="
          background: #fff3e0;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff9800">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        </div>
        <div style="flex: 1;">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #212121;
          ">${title}</h3>
          <p style="
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #424242;
            line-height: 1.5;
          ">${message}</p>
          <p style="
            margin: 0;
            font-size: 13px;
            color: #757575;
            line-height: 1.4;
          ">${details}</p>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button class="cancel-btn" id="cancelBtn">Cancel</button>
        <button class="confirm-btn" id="confirmBtn">Delete</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Handle events
    const confirmBtn = popup.querySelector('#confirmBtn') as HTMLButtonElement;
    const cancelBtn = popup.querySelector('#cancelBtn') as HTMLButtonElement;

    const closeDialog = () => {
      overlay.remove();
      style.remove();
    };

    confirmBtn.addEventListener('click', () => {
      onConfirm();
      closeDialog();
    });

    cancelBtn.addEventListener('click', closeDialog);

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // Close with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Displays a temporary notification
   */
  private showTemporaryNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Colors based on type
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      info: '#2196F3'
    };

    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      min-width: 200px;
      text-align: center;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Exit animation and removal after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 3000);
  }

  onSubmit(): void {
    this.formSubmitted = true;

    // Marquer tous les groupes du premier onglet comme "touched" pour déclencher la validation et l'icône ⚠️
    this.submittingEntityGroup.markAllAsTouched();
    this.ultimateParentUndertakingGroup.markAllAsTouched();
    this.affectedEntity.controls.forEach(ctrl => ctrl.markAllAsTouched());

    const f = this.incidentForm;
    const incidentSubmissionType = f.get('incidentSubmissionDetails.incidentSubmission')?.value;
    const detailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
    const impactForm = this.impactAssessmentComponent?.impactForm;
    const reportingForm = this.reportingToOtherAuthoritiesComponent?.reportingForm;
    const details = detailsForm?.value;
    const impact = impactForm?.value;
    const reporting = reportingForm?.value;
    const missingFields: string[] = [];

    // Special validation for Major Incident Reclassified as Non-Major
    if (incidentSubmissionType === 'major_incident_reclassified_as_non-major') {
      // Only validate specific required fields: 1.2, 1.3a, 1.4, 2.1, 2.10
      if (!f.get('incidentSubmissionDetails.incidentSubmission')?.value) missingFields.push('1.1 Incident Submission Type');
      if (!f.get('submittingEntity.name')?.value) missingFields.push('1.2 Submitting Entity Name');
      if (!f.get('submittingEntity.code')?.value) missingFields.push('1.3a Submitting Entity Code');
      
      // 1.4 - Check affected entity type for first affected entity
      const affectedEntities = f.get('affectedEntity') as FormArray;
      if (affectedEntities && affectedEntities.length > 0) {
        const firstEntity = affectedEntities.at(0);
        const affectedEntityType = firstEntity.get('affectedEntityType')?.value;
        if (!affectedEntityType || affectedEntityType.length === 0) {
          missingFields.push('1.4 Affected Entity Type');
        }
      } else {
        missingFields.push('1.4 Affected Entity Type (no affected entities defined)');
      }
      
      // 2.1 and 2.10 - From incident details form
      if (detailsForm) {
        if (!detailsForm.get('financialEntityCode')?.value) missingFields.push('2.1 Incident Reference Code');
        if (!detailsForm.get('otherInformation')?.value) missingFields.push('2.10 Other Information');
      } else {
        missingFields.push('2.1 Incident Reference Code (incident details form missing)');
        missingFields.push('2.10 Other Information (incident details form missing)');
      }
    } else {
      // Section 1 validation (for all types except Major Incident Reclassified as Non-Major)
      if (!f.get('incidentSubmissionDetails.incidentSubmission')?.value) missingFields.push('1.1 Incident Submission Type');
      if (!f.get('incidentSubmissionDetails.reportCurrency')?.value) missingFields.push('1.15 Report Currency');
      if (!f.get('submittingEntity.name')?.value) missingFields.push('1.2 Submitting Entity Name');
      const code = f.get('submittingEntity.code')?.value;
      const lei = f.get('submittingEntity.LEI')?.value;
      if (!code && !lei) missingFields.push('1.3a or 1.3b: At least one of Submitting Entity Code or LEI');
      const affectedEntities = f.get('affectedEntity') as FormArray;
      if (affectedEntities && affectedEntities.length > 0) {
        affectedEntities.controls.forEach((ctrl, i) => {
          if (!ctrl.get('LEI')?.value) missingFields.push(`1.6 Affected Entity LEI (row ${i+1})`);
        });
      }
      if (!f.get('primaryContact.name')?.value) missingFields.push('1.7 Primary Contact Name');
      if (!f.get('primaryContact.email')?.value || f.get('primaryContact.email')?.invalid) missingFields.push('1.8 Primary Contact Email (required/valid)');
      if (!f.get('primaryContact.phone')?.value) missingFields.push('1.9 Primary Contact Phone');
      if (!f.get('secondaryContact.name')?.value) missingFields.push('1.10 Secondary Contact Name');
      if (!f.get('secondaryContact.email')?.value || f.get('secondaryContact.email')?.invalid) missingFields.push('1.11 Secondary Contact Email (required/valid)');
      if (!f.get('secondaryContact.phone')?.value) missingFields.push('1.12 Secondary Contact Phone');
      //if (!f.get('ultimateParentUndertaking.name')?.value) missingFields.push('1.13 Ultimate Parent Undertaking Name');
      //if (!f.get('ultimateParentUndertaking.LEI')?.value) missingFields.push('1.14 Ultimate Parent Undertaking LEI');

      // Section 2 validation (for all types except Major Incident Reclassified as Non-Major)
      if (detailsForm) {
        if (!detailsForm.get('financialEntityCode')?.value) missingFields.push('2.1 Incident Reference Code');
        if (!detailsForm.get('detectionDate')?.value || !detailsForm.get('detectionTime')?.value) missingFields.push('2.2 Detection Date & Time');
        if (!detailsForm.get('classificationDate')?.value || !detailsForm.get('classificationTime')?.value) missingFields.push('2.3 Classification Date & Time');
        if (!detailsForm.get('incidentDescription')?.value) missingFields.push('2.4 Incident Description');
        if (!detailsForm.get('classificationCriterion')?.value || detailsForm.get('classificationCriterion')?.value.length === 0) missingFields.push('2.5 Classification Criteria');
        // 2.6 Country Code Materiality Thresholds is required only if 'geographical_spread' is selected in 2.5
        const classificationCriteria = detailsForm.get('classificationCriterion')?.value || [];
        const isGeoSpreadChecked = classificationCriteria.includes('geographical_spread');
        if (isGeoSpreadChecked && (!detailsForm.get('countryCodeMaterialityThresholds')?.value || detailsForm.get('countryCodeMaterialityThresholds')?.value.length === 0)) {
          missingFields.push('2.6 Country Code Materiality Thresholds');
        }
        if (!detailsForm.get('incidentDiscovery')?.value) missingFields.push('2.7 Incident Discovery');
        //if (!detailsForm.get('originatesFromThirdPartyProvider')?.value) missingFields.push('2.8 Originates From Third Party Provider');
        if (detailsForm.get('isBusinessContinuityActivated')?.value === null || detailsForm.get('isBusinessContinuityActivated')?.value === undefined) missingFields.push('2.9 Is Business Continuity Activated');
        //if (!detailsForm.get('otherInformation')?.value) missingFields.push('2.10 Other Information');
      }
    }

    // Section 3 validation (for intermediate_report and final_report)
    if (incidentSubmissionType === 'intermediate_report' || incidentSubmissionType === 'final_report') {
      if (!impactForm) {
        missingFields.push('Section 3: Impact Assessment form is missing');
      } else {
        const classificationCriteria = detailsForm?.get('classificationCriterion')?.value || [];
        const isReputationalImpactChecked = classificationCriteria.includes('reputational_impact');
        const isDurationDowntimeChecked = classificationCriteria.includes('duration_and_service_downtime');
        const isGeoSpreadChecked = classificationCriteria.includes('geographical_spread');
        const isDataLossesChecked = classificationCriteria.includes('data_losses');

        if (!impactForm.get('competentAuthorityCode')?.value) missingFields.push('3.1 Competent Authority Code');
        if (!impactForm.get('occurrenceDate')?.value || !impactForm.get('occurrenceTime')?.value) missingFields.push('3.2 Incident Occurrence Date & Time');
        if (!impactForm.get('recoveryDate')?.value || !impactForm.get('recoveryTime')?.value) missingFields.push('3.3 Service Restoration Date & Time');
        if (!impactForm.get('number')?.value) missingFields.push('3.4 Number of Clients Affected');
        if (!impactForm.get('percentage')?.value) missingFields.push('3.5 Percentage of Clients Affected');
        if (!impactForm.get('numberOfFinancialCounterpartsAffected')?.value) missingFields.push('3.6 Number of Financial Counterparts Affected');
        if (!impactForm.get('percentageOfFinancialCounterpartsAffected')?.value) missingFields.push('3.7 Percentage of Financial Counterparts Affected');
        if (impactForm.get('hasImpactOnRelevantClients')?.value === null || impactForm.get('hasImpactOnRelevantClients')?.value === undefined) missingFields.push('3.8 Has Impact on Relevant Clients');
        if (!impactForm.get('numberOfAffectedTransactions')?.value) missingFields.push('3.9 Number of Affected Transactions');
        if (!impactForm.get('percentageOfAffectedTransactions')?.value) missingFields.push('3.10 Percentage of Affected Transactions');
        if (!impactForm.get('valueOfAffectedTransactions')?.value) missingFields.push('3.11 Value of Affected Transactions');
        if (!impactForm.get('numbersActualEstimate')?.value || impactForm.get('numbersActualEstimate')?.value.length === 0) missingFields.push('3.12 Reported Data Status');
        
        if (isReputationalImpactChecked && (!impactForm.get('reputationalImpactType')?.value || impactForm.get('reputationalImpactType')?.value.length === 0)) {
          missingFields.push('3.13 Reputational Impact Type');
        }

        if (isReputationalImpactChecked && !impactForm.get('reputationalImpactDescription')?.value) {
          missingFields.push('3.14 Reputational Impact Description');
        }

        if (!impactForm.get('incidentDuration')?.value) missingFields.push('3.15 Incident Duration (DD:HH:MM)');
        if (!impactForm.get('serviceDowntime')?.value) missingFields.push('3.16 Service Downtime (DD:HH:MM)');
        
        if (isDurationDowntimeChecked && !impactForm.get('informationDurationServiceDowntimeActualOrEstimate')?.value) {
          missingFields.push('3.17 Duration and Downtime Information Type');
        }

        if (isGeoSpreadChecked && (!impactForm.get('memberStatesImpactType')?.value || impactForm.get('memberStatesImpactType')?.value.length === 0)) {
          missingFields.push('3.18 Types of Impact in Member States');
        }

        if (isGeoSpreadChecked && !impactForm.get('memberStatesImpactTypeDescription')?.value) {
          missingFields.push('3.19 Member States Impact Type Description');
        }

        if (isDataLossesChecked && (!impactForm.get('dataLosseMaterialityThresholds')?.value || impactForm.get('dataLosseMaterialityThresholds')?.value.length === 0)) {
          missingFields.push('3.20 Materiality Thresholds for Data Losses');
        }

        if (isDataLossesChecked && !impactForm.get('dataLossesDescription')?.value) {
          missingFields.push('3.21 Data Losses Description');
        }

        if (!impactForm.get('criticalServicesAffected')?.value) missingFields.push('3.22 Critical Services Affected');
        if (!impactForm.get('IncidentType')?.value || impactForm.get('IncidentType')?.value.length === 0) missingFields.push('3.23 Type of the Major ICT-related Incident');

        const incidentTypes = impactForm.get('IncidentType')?.value || [];
        if (incidentTypes.includes('other') && !impactForm.get('otherIncidentClassification')?.value) {
          missingFields.push('3.24 Other Incident Classification');
        }

        if (incidentTypes.includes('cybersecurity_related') && (!impactForm.get('threatTechniques')?.value || impactForm.get('threatTechniques')?.value.length === 0)) {
          missingFields.push('3.25 Threats and Techniques Used by Threat Actor');
        }

        const threatTechniques = impactForm.get('threatTechniques')?.value || [];
        if (threatTechniques.includes('other') && !impactForm.get('otherThreatTechniques')?.value) {
          missingFields.push('3.26 Other Threat Techniques');
        }

        if (!impactForm.get('affectedFunctionalAreas')?.value) missingFields.push('3.27 Affected Functional Areas');
        if (!impactForm.get('isAffectedInfrastructureComponents')?.value) missingFields.push('3.28 Is Infrastructure Components Affected');
        if (!impactForm.get('affectedInfrastructureComponents')?.value) missingFields.push('3.29 Affected Infrastructure Components');
        if (!impactForm.get('isImpactOnFinancialInterest')?.value) missingFields.push('3.30 Impact on Financial Interest of Clients');
        if (!impactForm.get('reportingToOtherAuthorities')?.value || impactForm.get('reportingToOtherAuthorities')?.value.length === 0) missingFields.push('3.31 Reporting to Other Authorities');

        const reportedAuthorities = impactForm.get('reportingToOtherAuthorities')?.value || [];
        if (reportedAuthorities.includes('other') && !impactForm.get('reportingToOtherAuthoritiesOther')?.value) {
          missingFields.push('3.32 Other Authorities Description');
        }

        if (impactForm.get('isTemporaryActionsMeasuresForRecovery')?.value === null || impactForm.get('isTemporaryActionsMeasuresForRecovery')?.value === undefined) {
          missingFields.push('3.33 Temporary Actions or Measures for Recovery');
        } else if (impactForm.get('isTemporaryActionsMeasuresForRecovery')?.value === true && !impactForm.get('descriptionOfTemporaryActionsMeasuresForRecovery')?.value) {
          missingFields.push('3.34 Description of Temporary Actions/Measures');
        }

        if (incidentTypes.includes('cybersecurity_related') && !impactForm.get('indicatorsOfCompromise')?.value) {
          missingFields.push('3.35 Indicators of Compromise');
        }
      }
    }

    // Section 4 validation (for final_report)
    if (incidentSubmissionType === 'final_report') {
      if (!reportingForm) {
        missingFields.push('Section 4: Reporting to Other Authorities form is missing');
    } else {
        if (!reportingForm.get('rootCauseHLClassification')?.value || reportingForm.get('rootCauseHLClassification')?.value.length === 0) missingFields.push('4.1 High-Level Classification of Root Causes of the Incident');
        if (!reportingForm.get('rootCausesDetailedClassification')?.value || reportingForm.get('rootCausesDetailedClassification')?.value.length === 0) missingFields.push('4.2 Detailed Classification of Root Causes of the Incident');
        if (!reportingForm.get('rootCausesAdditionalClassification')?.value || reportingForm.get('rootCausesAdditionalClassification')?.value.length === 0) missingFields.push('4.3 Additional Classification of Root Causes of the Incident');
        const detailed = reportingForm.get('rootCausesDetailedClassification')?.value || [];
        const requireOther = detailed.some((val: string) => [
          'process_failure_other',
          'system_failure_other',
          'human_error_other',
          'external_event_other'
        ].includes(val));
        if (requireOther && !reportingForm.get('rootCausesOther')?.value) missingFields.push('4.4 Other Root Causes');
        if (!reportingForm.get('rootCausesInformation')?.value) missingFields.push('4.5 Root Causes Information');
        if (!reportingForm.get('incidentResolutionSummary')?.value) missingFields.push('4.6 Incident Resolution Summary');
        if (!reportingForm.get('incidentRootCauseAddressedDate')?.value || !reportingForm.get('incidentRootCauseAddressedTime')?.value) missingFields.push('4.7 Incident Root Cause Addressed Date & Time');
        if (!reportingForm.get('incidentWasResolvedDate')?.value || !reportingForm.get('incidentWasResolvedTime')?.value) missingFields.push('4.8 Incident Was Resolved Date & Time');
        if (!reportingForm.get('incidentResolutionVsPlannedImplementation')?.value) missingFields.push('4.9 Incident Resolution vs Planned Implementation');
        if (!reportingForm.get('assessmentOfRiskToCriticalFunctions')?.value) missingFields.push('4.10 Assessment of Risk to Critical Functions');
        if (!reportingForm.get('informationRelevantToResolutionAuthorities')?.value) missingFields.push('4.11 Information Relevant to Resolution Authorities');
        if (!reportingForm.get('economicImpactMaterialityThreshold')?.value) missingFields.push('4.12 Economic Impact Materiality Threshold');
        if (!reportingForm.get('grossAmountIndirectDirectCosts')?.value) missingFields.push('4.13 Gross Amount of Indirect & Direct Costs');
        if (!reportingForm.get('financialRecoveriesAmount')?.value) missingFields.push('4.14 Amount of Financial Recoveries');
        if (!reportingForm.get('recurringNonMajorIncidentsDescription')?.value) missingFields.push('4.15 Description of Recurring Non-Major Incidents');
        if (!reportingForm.get('occurrenceOfRecurringIncidentsDate')?.value || !reportingForm.get('recurringIncidentDate')?.value) missingFields.push('4.16 Occurrence of Recurring Incidents Date & Time');
      }
    }

    // Only allow file generation if all required fields are filled/valid
    if (missingFields.length > 0) {
      this.markFormGroupTouched(this.incidentForm);
      if (detailsForm) this.markFormGroupTouched(detailsForm);
      if (impactForm) this.markFormGroupTouched(impactForm);
      if (reportingForm) this.markFormGroupTouched(reportingForm);
      //alert('Please fill in the following required fields:\n' + missingFields.join('\n'));
      return;
    }

    // Data extraction and transformation according to DORA IR Schema v1.2
    const formatDateTime = (date: string, time: string): string | undefined => {
      if (!date || !time) return undefined;
      
      const dateObj = new Date(date);
      const timeParts = time.split(':');
      const hours = Number(timeParts[0]);
      const minutes = Number(timeParts[1]);
      const seconds = timeParts.length > 2 ? Number(timeParts[2]) : 0;
      
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return undefined;
      
      dateObj.setHours(hours, minutes, seconds, 0);
      return dateObj.toISOString();
    };
    
    const formatDate = (date: string | Date): string | undefined => {
      if (!date) return undefined;
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return undefined;
      return dateObj.toISOString();
    };

    // Helper function to build classification types array
    const buildClassificationTypes = (): any[] => {
      const classificationTypes: any[] = [];
      const criteria = details?.classificationCriterion || [];
      
      criteria.forEach((criterion: string) => {
        const classificationType: any = {
          classificationCriterion: criterion
        };

        // Add specific fields based on criterion type
        if (criterion === 'geographical_spread') {
          if (details?.countryCodeMaterialityThresholds?.length > 0) {
            classificationType.countryCodeMaterialityThresholds = details.countryCodeMaterialityThresholds;
          }
          if (impact?.memberStatesImpactType?.length > 0) {
            classificationType.memberStatesImpactType = impact.memberStatesImpactType;
          }
          if (impact?.memberStatesImpactTypeDescription) {
            classificationType.memberStatesImpactTypeDescription = impact.memberStatesImpactTypeDescription;
          }
        } else if (criterion === 'data_losses') {
          if (impact?.dataLosseMaterialityThresholds?.length > 0) {
            classificationType.dataLosseMaterialityThresholds = impact.dataLosseMaterialityThresholds;
          }
          if (impact?.dataLossesDescription) {
            classificationType.dataLossesDescription = impact.dataLossesDescription;
          }
        } else if (criterion === 'reputational_impact') {
          if (impact?.reputationalImpactType?.length > 0) {
            classificationType.reputationalImpactType = impact.reputationalImpactType;
          }
          if (impact?.reputationalImpactDescription) {
            classificationType.reputationalImpactDescription = impact.reputationalImpactDescription;
          }
        } else if (criterion === 'economic_impact') {
          if (reporting?.economicImpactMaterialityThreshold) {
            classificationType.economicImpactMaterialityThreshold = reporting.economicImpactMaterialityThreshold;
          }
        }

        classificationTypes.push(classificationType);
      });

      return classificationTypes;
    };

    // Build the DORA IR compliant JSON structure
    const doraReport: any = {
      incidentSubmission: f.value.incidentSubmissionDetails?.incidentSubmission,
      reportCurrency: f.value.incidentSubmissionDetails?.reportCurrency,
      submittingEntity: {
        entityType: "SUBMITTING_ENTITY",
        name: f.value.submittingEntity?.name,
        ...(f.value.submittingEntity?.code && { code: f.value.submittingEntity.code }),
        ...(f.value.submittingEntity?.LEI && { LEI: f.value.submittingEntity.LEI }),
        affectedEntityType: ["credit_institution"] // Default value as per schema
      },
      affectedEntity: (f.value.affectedEntity || []).map((entity: any) => ({
        entityType: "AFFECTED_ENTITY",
        name: entity.name || "String",
        ...(entity.code && { code: entity.code }),
        LEI: entity.LEI || "00000000000000000000",
        affectedEntityType: entity.affectedEntityType?.length > 0 ? entity.affectedEntityType : ["credit_institution"]
      })),
      primaryContact: {
        name: f.value.primaryContact?.name,
        email: f.value.primaryContact?.email,
        phone: f.value.primaryContact?.phone
      },
      secondaryContact: {
        name: f.value.secondaryContact?.name,
        email: f.value.secondaryContact?.email,
        phone: f.value.secondaryContact?.phone
      }
    };

    // Add ultimateParentUndertaking if provided
    if (f.value.ultimateParentUndertaking?.name || f.value.ultimateParentUndertaking?.LEI) {
      doraReport.ultimateParentUndertaking = {
        entityType: "ULTIMATE_PARENT_UNDERTAKING_ENTITY",
        name: f.value.ultimateParentUndertaking?.name || "String",
        ...(f.value.ultimateParentUndertaking?.code && { code: f.value.ultimateParentUndertaking.code }),
        LEI: f.value.ultimateParentUndertaking?.LEI || "00000000000000000000",
        affectedEntityType: ["credit_institution"]
      };
    }

    // Add incident details
    if (details) {
      doraReport.incident = {
        ...(details.financialEntityCode && { financialEntityCode: details.financialEntityCode }),
        ...(formatDateTime(details.detectionDate, details.detectionTime) && { 
          detectionDateTime: formatDateTime(details.detectionDate, details.detectionTime) 
        }),
        ...(formatDateTime(details.classificationDate, details.classificationTime) && { 
          classificationDateTime: formatDateTime(details.classificationDate, details.classificationTime) 
        }),
        incidentDescription: details.incidentDescription || "String",
        ...(details.otherInformation && { otherInformation: details.otherInformation }),
        classificationTypes: buildClassificationTypes(),
        ...(details.isBusinessContinuityActivated !== null && details.isBusinessContinuityActivated !== undefined && {
          isBusinessContinuityActivated: details.isBusinessContinuityActivated
        }),
        ...(formatDateTime(impact?.occurrenceDate, impact?.occurrenceTime) && {
          incidentOccurrenceDateTime: formatDateTime(impact.occurrenceDate, impact.occurrenceTime)
        }),
        ...(impact?.incidentDuration && { incidentDuration: impact.incidentDuration }),
        ...(details.originatesFromThirdPartyProvider && { 
          originatesFromThirdPartyProvider: details.originatesFromThirdPartyProvider 
        }),
        ...(details.incidentDiscovery && { incidentDiscovery: details.incidentDiscovery }),
        ...(impact?.competentAuthorityCode && { competentAuthorityCode: impact.competentAuthorityCode })
      };

      // Add incident type if available
      if (impact?.IncidentType?.length > 0) {
        doraReport.incident.incidentType = {
          incidentClassification: impact.IncidentType,
          ...(impact.otherIncidentClassification && { otherIncidentClassification: impact.otherIncidentClassification }),
          ...(impact.threatTechniques?.length > 0 && { threatTechniques: impact.threatTechniques }),
          ...(impact.otherThreatTechniques && { otherThreatTechniques: impact.otherThreatTechniques }),
          ...(impact.indicatorsOfCompromise && { indicatorsOfCompromise: impact.indicatorsOfCompromise })
        };
      }

      // Add root cause information if available (for intermediate and final reports)
      if (reporting && (incidentSubmissionType === 'intermediate_report' || incidentSubmissionType === 'final_report')) {
        if (reporting.rootCauseHLClassification?.length > 0) {
          doraReport.incident.rootCauseHLClassification = reporting.rootCauseHLClassification;
        }
        if (reporting.rootCausesDetailedClassification?.length > 0) {
          doraReport.incident.rootCausesDetailedClassification = reporting.rootCausesDetailedClassification;
        }
        if (reporting.rootCausesAdditionalClassification?.length > 0) {
          doraReport.incident.rootCausesAdditionalClassification = reporting.rootCausesAdditionalClassification;
        }
        if (reporting.rootCausesOther) {
          doraReport.incident.rootCausesOther = reporting.rootCausesOther;
        }
        if (reporting.rootCausesInformation) {
          doraReport.incident.rootCausesInformation = reporting.rootCausesInformation;
        }
        if (reporting.rootCauseAddressingDateTime || formatDateTime(reporting.incidentRootCauseAddressedDate, reporting.incidentRootCauseAddressedTime)) {
          doraReport.incident.rootCauseAddressingDateTime = reporting.rootCauseAddressingDateTime || 
            formatDateTime(reporting.incidentRootCauseAddressedDate, reporting.incidentRootCauseAddressedTime);
        }
        if (reporting.incidentResolutionSummary) {
          doraReport.incident.incidentResolutionSummary = reporting.incidentResolutionSummary;
        }
        if (reporting.incidentResolutionDateTime || formatDateTime(reporting.incidentWasResolvedDate, reporting.incidentWasResolvedTime)) {
          doraReport.incident.incidentResolutionDateTime = reporting.incidentResolutionDateTime || 
            formatDateTime(reporting.incidentWasResolvedDate, reporting.incidentWasResolvedTime);
        }
        if (reporting.incidentResolutionVsPlannedImplementation) {
          doraReport.incident.incidentResolutionVsPlannedImplementation = reporting.incidentResolutionVsPlannedImplementation;
        }
        if (reporting.assessmentOfRiskToCriticalFunctions) {
          doraReport.incident.assessmentOfRiskToCriticalFunctions = reporting.assessmentOfRiskToCriticalFunctions;
        }
        if (reporting.informationRelevantToResolutionAuthorities) {
          doraReport.incident.informationRelevantToResolutionAuthorities = reporting.informationRelevantToResolutionAuthorities;
        }
        if (reporting.financialRecoveriesAmount !== null && reporting.financialRecoveriesAmount !== undefined) {
          doraReport.incident.financialRecoveriesAmount = Number(reporting.financialRecoveriesAmount);
        }
        if (reporting.grossAmountIndirectDirectCosts !== null && reporting.grossAmountIndirectDirectCosts !== undefined) {
          doraReport.incident.grossAmountIndirectDirectCosts = Number(reporting.grossAmountIndirectDirectCosts);
        }
        if (reporting.recurringNonMajorIncidentsDescription) {
          doraReport.incident.recurringNonMajorIncidentsDescription = reporting.recurringNonMajorIncidentsDescription;
        }
        if (reporting.recurringIncidentDate || formatDateTime(reporting.occurrenceOfRecurringIncidentsDate, '00:00:00')) {
          doraReport.incident.recurringIncidentDate = reporting.recurringIncidentDate || 
            formatDateTime(reporting.occurrenceOfRecurringIncidentsDate, '00:00:00');
        }
      }
      
      // Add available root cause information from reporting form for initial notifications and intermediate reports
      if (reporting && (incidentSubmissionType === 'initial_notification' || incidentSubmissionType === 'intermediate_report')) {
        // Only add fields that have actual values from the form
        if (reporting.rootCauseHLClassification?.length > 0) {
          doraReport.incident.rootCauseHLClassification = reporting.rootCauseHLClassification;
        }
        if (reporting.rootCausesAdditionalClassification?.length > 0) {
          doraReport.incident.rootCausesAdditionalClassification = reporting.rootCausesAdditionalClassification;
        }
        if (reporting.rootCausesOther) {
          doraReport.incident.rootCausesOther = reporting.rootCausesOther;
        }
        if (reporting.rootCausesInformation) {
          doraReport.incident.rootCausesInformation = reporting.rootCausesInformation;
        }
        if (reporting.rootCauseAddressingDateTime || formatDateTime(reporting.incidentRootCauseAddressedDate, reporting.incidentRootCauseAddressedTime)) {
          doraReport.incident.rootCauseAddressingDateTime = reporting.rootCauseAddressingDateTime || 
            formatDateTime(reporting.incidentRootCauseAddressedDate, reporting.incidentRootCauseAddressedTime);
        }
        if (reporting.incidentResolutionSummary) {
          doraReport.incident.incidentResolutionSummary = reporting.incidentResolutionSummary;
        }
        if (reporting.incidentResolutionDateTime || formatDateTime(reporting.incidentWasResolvedDate, reporting.incidentWasResolvedTime)) {
          doraReport.incident.incidentResolutionDateTime = reporting.incidentResolutionDateTime || 
            formatDateTime(reporting.incidentWasResolvedDate, reporting.incidentWasResolvedTime);
        }
        if (reporting.incidentResolutionVsPlannedImplementation) {
          doraReport.incident.incidentResolutionVsPlannedImplementation = reporting.incidentResolutionVsPlannedImplementation;
        }
        if (reporting.assessmentOfRiskToCriticalFunctions) {
          doraReport.incident.assessmentOfRiskToCriticalFunctions = reporting.assessmentOfRiskToCriticalFunctions;
        }
        if (reporting.informationRelevantToResolutionAuthorities) {
          doraReport.incident.informationRelevantToResolutionAuthorities = reporting.informationRelevantToResolutionAuthorities;
        }
        if (reporting.financialRecoveriesAmount !== null && reporting.financialRecoveriesAmount !== undefined) {
          doraReport.incident.financialRecoveriesAmount = Number(reporting.financialRecoveriesAmount);
        }
        if (reporting.grossAmountIndirectDirectCosts !== null && reporting.grossAmountIndirectDirectCosts !== undefined) {
          doraReport.incident.grossAmountIndirectDirectCosts = Number(reporting.grossAmountIndirectDirectCosts);
        }
        if (reporting.recurringNonMajorIncidentsDescription) {
          doraReport.incident.recurringNonMajorIncidentsDescription = reporting.recurringNonMajorIncidentsDescription;
        }
        if (reporting.recurringIncidentDate || formatDateTime(reporting.occurrenceOfRecurringIncidentsDate, '00:00:00')) {
          doraReport.incident.recurringIncidentDate = reporting.recurringIncidentDate || 
            formatDateTime(reporting.occurrenceOfRecurringIncidentsDate, '00:00:00');
        }
      }
    }

    // Add impact assessment for ALL report types with real form data
    if (impact) {
      doraReport.impactAssessment = {
        hasImpactOnRelevantClients: impact.hasImpactOnRelevantClients !== null && impact.hasImpactOnRelevantClients !== undefined ? impact.hasImpactOnRelevantClients : false,
        serviceImpact: {
          ...(impact.serviceDowntime && { serviceDowntime: impact.serviceDowntime }),
          ...(formatDateTime(impact.recoveryDate, impact.recoveryTime) && {
            serviceRestorationDateTime: formatDateTime(impact.recoveryDate, impact.recoveryTime)
          }),
          ...(impact.isTemporaryActionsMeasuresForRecovery !== null && impact.isTemporaryActionsMeasuresForRecovery !== undefined && {
            isTemporaryActionsMeasuresForRecovery: impact.isTemporaryActionsMeasuresForRecovery
          }),
          ...(impact.descriptionOfTemporaryActionsMeasuresForRecovery && {
            descriptionOfTemporaryActionsMeasuresForRecovery: impact.descriptionOfTemporaryActionsMeasuresForRecovery
          })
        },
        ...(impact.criticalServicesAffected && { criticalServicesAffected: impact.criticalServicesAffected }),
        affectedAssets: {
          ...(impact.number !== null && impact.number !== undefined && impact.percentage !== null && impact.percentage !== undefined && {
            affectedClients: {
              number: Number(impact.number),
              percentage: Number(impact.percentage)
            }
          }),
          ...(impact.numberOfFinancialCounterpartsAffected !== null && impact.numberOfFinancialCounterpartsAffected !== undefined && 
              impact.percentageOfFinancialCounterpartsAffected !== null && impact.percentageOfFinancialCounterpartsAffected !== undefined && {
            affectedFinancialCounterparts: {
              number: Number(impact.numberOfFinancialCounterpartsAffected),
              percentage: Number(impact.percentageOfFinancialCounterpartsAffected)
            }
          }),
          ...(impact.numberOfAffectedTransactions !== null && impact.numberOfAffectedTransactions !== undefined && 
              impact.percentageOfAffectedTransactions !== null && impact.percentageOfAffectedTransactions !== undefined && {
            affectedTransactions: {
              number: Number(impact.numberOfAffectedTransactions),
              percentage: Number(impact.percentageOfAffectedTransactions)
            }
          }),
          ...(impact.valueOfAffectedTransactions !== null && impact.valueOfAffectedTransactions !== undefined && {
            valueOfAffectedTransactions: Number(impact.valueOfAffectedTransactions)
          }),
          ...(impact.numbersActualEstimate?.length > 0 && { numbersActualEstimate: impact.numbersActualEstimate })
        },
        ...(impact.affectedFunctionalAreas && { affectedFunctionalAreas: impact.affectedFunctionalAreas }),
        ...(impact.isAffectedInfrastructureComponents && { isAffectedInfrastructureComponents: impact.isAffectedInfrastructureComponents }),
        ...(impact.affectedInfrastructureComponents && { affectedInfrastructureComponents: impact.affectedInfrastructureComponents }),
        ...(impact.isImpactOnFinancialInterest && { isImpactOnFinancialInterest: impact.isImpactOnFinancialInterest })
      };
    }

    // Add reporting to other authorities if available
    if (impact?.reportingToOtherAuthorities?.length > 0) {
      doraReport.reportingToOtherAuthorities = impact.reportingToOtherAuthorities;
      if (impact.reportingToOtherAuthoritiesOther) {
        doraReport.reportingToOtherAuthoritiesOther = impact.reportingToOtherAuthoritiesOther;
      }
    }

    // Add duration and downtime information if available
    if (impact?.informationDurationServiceDowntimeActualOrEstimate) {
      doraReport.informationDurationServiceDowntimeActualOrEstimate = impact.informationDurationServiceDowntimeActualOrEstimate;
    }

    // File generation logic
    let filename = '';
    if (incidentSubmissionType === 'final_report') {
      filename = 'DORA_IR_FinalReport.json';
    } else if (incidentSubmissionType === 'intermediate_report') {
      filename = 'DORA_IR_IntermediateReport.json';
    } else if (incidentSubmissionType === 'initial_notification') {
      filename = 'DORA_IR_InitialNotification.json';
    } else if (incidentSubmissionType === 'major_incident_reclassified_as_non-major') {
      filename = 'DORA_IR_ReclassifiedIncident.json';
    }

    this.downloadJson(doraReport, filename);
  }

  private downloadJson(data: any, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  submitForm(): void {
    this.formSubmitted = true;
    if (this.incidentForm.valid) {
      console.log('Form Value:', this.incidentForm.value);
    } else {
      this.markFormGroupTouched(this.incidentForm);
    }
  }

  resetForm(): void {
    this.incidentForm.reset({
      submissionDate: new Date(),
      reportedToAuthorities: false
    });
    this.formSubmitted = false;
  }

  private dateValidator(): Validators {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const date = control.value;
      if (!date) return null;

      const selectedDate = new Date(date);
      const today = new Date();

      if (selectedDate > today) {
        return { futureDate: true };
      }
      return null;
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Clear all validators from main form except the incident submission details
   */
  private clearAllValidatorsExceptRequiredForReclassified(): void {
    // Clear validators from affected entities
    const affectedEntitiesArray = this.incidentForm.get('affectedEntity') as FormArray;
    if (affectedEntitiesArray) {
      affectedEntitiesArray.controls.forEach(control => {
        const group = control as FormGroup;
        Object.keys(group.controls).forEach(key => {
          const fieldControl = group.get(key);
          if (fieldControl) {
            fieldControl.clearValidators();
            fieldControl.updateValueAndValidity();
          }
        });
      });
    }
    
    // Clear validators from ultimate parent undertaking
    const ultimateParentGroup = this.incidentForm.get('ultimateParentUndertaking') as FormGroup;
    if (ultimateParentGroup) {
      ultimateParentGroup.clearValidators();
      Object.keys(ultimateParentGroup.controls).forEach(key => {
        const control = ultimateParentGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
      ultimateParentGroup.updateValueAndValidity();
    }
    
    // Clear validators from primary and secondary contacts
    const primaryContactGroup = this.incidentForm.get('primaryContact') as FormGroup;
    if (primaryContactGroup) {
      Object.keys(primaryContactGroup.controls).forEach(key => {
        const control = primaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    const secondaryContactGroup = this.incidentForm.get('secondaryContact') as FormGroup;
    if (secondaryContactGroup) {
      Object.keys(secondaryContactGroup.controls).forEach(key => {
        const control = secondaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    // Clear validators from other main form fields, excluding incident submission details and submitting entity
    const fieldsToKeepValidators = ['incidentSubmissionDetails', 'submittingEntity'];
    Object.keys(this.incidentForm.controls).forEach(key => {
      if (!fieldsToKeepValidators.includes(key)) {
        const control = this.incidentForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    });
  }

  get affectedEntity(): FormArray {
    return this.incidentForm.get('affectedEntity') as FormArray;
  }

  addAffectedEntity(): void {
    this.affectedEntity.push(this.fb.group({
      name: [''],
      LEI: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
      affectedEntityType: [[]],
      entityType: ['AFFECTED_ENTITY']
    }));
  }

  get submittingEntityGroup(): FormGroup {
    return this.incidentForm.get('submittingEntity') as FormGroup;
  }
  get ultimateParentUndertakingGroup(): FormGroup {
    return this.incidentForm.get('ultimateParentUndertaking') as FormGroup;
  }

  get primaryContactGroup(): FormGroup {
    return this.incidentForm.get('primaryContact') as FormGroup;
  }
  get secondaryContactGroup(): FormGroup {
    return this.incidentForm.get('secondaryContact') as FormGroup;
  }

  formatAffectedEntityTypeLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/-/g, ' ');
  }

  get entityInformationTabLabel(): string {
    // First check if incident submission type is selected
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    
    // Don't show warning icon if no incident submission type is selected yet
    if (!incidentSubmissionType) {
      return 'Entity Information';
    }
    
    // Check if any required fields have errors that should be displayed
    const hasVisibleErrors = this.hasVisibleValidationErrors();
    
    if (hasVisibleErrors) {
      return 'Entity Information ⚠️';
    }
    return 'Entity Information';
  }

  private hasVisibleValidationErrors(): boolean {
    // Get current incident submission type
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    
    // Helper function to check if a control has validation errors that should be shown
    const hasError = (controlPath: string, checkRequiredOnly: boolean = false): boolean => {
      const control = this.incidentForm.get(controlPath);
      if (!control) return false;
      
      if (checkRequiredOnly) {
        // For required fields, show error if field is empty and has required validator
        const hasRequiredError = control.hasError('required');
        const isEmpty = !control.value || control.value === '';
        return hasRequiredError || isEmpty;
      }
      
      // For other validations, show error only if touched or form submitted
      return !!(control.invalid && (control.touched || this.formSubmitted));
    };

    // Special handling for Major Incident Reclassified as Non-Major
    if (incidentSubmissionType === 'major_incident_reclassified_as_non-major') {
      // Only check the specific required fields for this type:
      // 1.2 - submittingEntity.name
      // 1.3a - submittingEntity.code  
      // 1.4 - affectedEntity[0].affectedEntityType
      const submittingEntityNameError = hasError('submittingEntity.name', true);
      const submittingEntityCodeError = hasError('submittingEntity.code', true);
      
      // Check 1.4 - affectedEntityType for first affected entity
      let affectedEntityTypeError = false;
      if (this.affectedEntity && this.affectedEntity.length > 0) {
        const firstAffectedEntity = this.affectedEntity.at(0);
        const affectedEntityTypeControl = firstAffectedEntity.get('affectedEntityType');
        if (affectedEntityTypeControl) {
          const isEmpty = !affectedEntityTypeControl.value || affectedEntityTypeControl.value.length === 0;
          const hasValidationError = affectedEntityTypeControl.invalid && (affectedEntityTypeControl.touched || this.formSubmitted);
          affectedEntityTypeError = isEmpty || hasValidationError;
        }
      }
      
      return submittingEntityNameError || submittingEntityCodeError || affectedEntityTypeError;
    }

    // Default validation for other incident types
    // Check submitting entity validation errors
    const submittingEntityErrors = 
      hasError('submittingEntity.name', true) ||
      hasError('submittingEntity.LEI') ||
      (this.submittingEntityGroup?.hasError('codeOrLeiRequired'));

    // Check primary contact validation errors - all are required
    const primaryContactErrors =
      hasError('primaryContact.name', true) ||
      hasError('primaryContact.email', true) ||
      hasError('primaryContact.phone', true);

    // Check secondary contact validation errors - all are required  
    const secondaryContactErrors =
      hasError('secondaryContact.name', true) ||
      hasError('secondaryContact.email', true) ||
      hasError('secondaryContact.phone', true);

    // Check ultimate parent undertaking validation errors (not required by default)
    const ultimateParentErrors =
      hasError('ultimateParentUndertaking.name') ||
      hasError('ultimateParentUndertaking.LEI');

    // Check affected entities validation errors - LEI is required
    let affectedEntityErrors = false;
    if (this.affectedEntity && this.affectedEntity.length > 0) {
      affectedEntityErrors = this.affectedEntity.controls.some((ctrl) => {
        const leiControl = ctrl.get('LEI');
        if (!leiControl) return false;
        
        // LEI is required, show error if empty
        const isEmpty = !leiControl.value || leiControl.value === '';
        const hasValidationError = leiControl.invalid && (leiControl.touched || this.formSubmitted);
        
        return isEmpty || hasValidationError;
      });
    }

    // Check if report currency has errors (required field)
    const reportCurrencyErrors = hasError('incidentSubmissionDetails.reportCurrency', true);

    return submittingEntityErrors || primaryContactErrors || secondaryContactErrors || 
           ultimateParentErrors || affectedEntityErrors || reportCurrencyErrors;
  }

  get incidentDetailsTabLabel(): string {
    // First check if incident submission type is selected
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    
    // Don't show warning icon if no incident submission type is selected yet
    if (!incidentSubmissionType) {
      return 'Incident Details';
    }
    
    if (this.incidentDetailsFormComponent && this.incidentDetailsFormComponent.incidentDetailsForm && this.incidentDetailsFormComponent.incidentDetailsForm.invalid) {
      return 'Incident Details ⚠️';
    }
    return 'Incident Details';
  }

  get impactAssessmentTabLabel(): string {
    // First check if incident submission type is selected
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    
    // Don't show warning icon if no incident submission type is selected yet
    if (!incidentSubmissionType) {
      return 'Impact Assessment';
    }
    
    if (this.impactAssessmentComponent && this.impactAssessmentComponent.impactForm && this.impactAssessmentComponent.impactForm.invalid) {
      return 'Impact Assessment ⚠️';
    }
    return 'Impact Assessment';
  }

  get reportingToOtherAuthoritiesTabLabel(): string {
    // First check if incident submission type is selected
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    
    // Don't show warning icon if no incident submission type is selected yet
    if (!incidentSubmissionType) {
      return 'Reporting to Other Authorities';
    }
    
    if (this.reportingToOtherAuthoritiesComponent && this.reportingToOtherAuthoritiesComponent.reportingForm && this.reportingToOtherAuthoritiesComponent.reportingForm.invalid) {
      return 'Reporting to Other Authorities ⚠️';
    }
    return 'Reporting to Other Authorities';
  }

  get isGenerateReportButtonDisabled(): boolean {
    // Disable the button only if the incident submission type is not selected
    const incidentSubmissionType = this.incidentForm.get('incidentSubmissionDetails.incidentSubmission')?.value;
    return !incidentSubmissionType;
  }

  /**
   * Handle validation for Major Incident Reclassified as Non-Major
   * Only fields 1.2, 1.3a, 1.4, 2.1 and 2.10 should be required
   */
  private handleMajorIncidentReclassifiedValidation(): void {
    // Clear validators from incident submission details (including Report Currency 1.15)
    const incidentSubmissionGroup = this.incidentForm.get('incidentSubmissionDetails') as FormGroup;
    if (incidentSubmissionGroup) {
      // Keep only the incident submission type as required, clear report currency validator
      const reportCurrencyControl = incidentSubmissionGroup.get('reportCurrency');
      if (reportCurrencyControl) {
        reportCurrencyControl.clearValidators();
        reportCurrencyControl.updateValueAndValidity();
      }
    }

    // Clear ALL validators from submittingEntity EXCEPT name and code
    const submittingEntityGroup = this.incidentForm.get('submittingEntity') as FormGroup;
    if (submittingEntityGroup) {
      // Clear the group validator (codeOrLeiRequiredValidator)
      submittingEntityGroup.clearValidators();
      submittingEntityGroup.updateValueAndValidity();
      
      // Clear validators from LEI field (keep only name and code as required)
      const leiControl = submittingEntityGroup.get('LEI');
      if (leiControl) {
        leiControl.clearValidators();
        leiControl.updateValueAndValidity();
      }
      
      // Set required validators only for the specific fields
      // 1.2 - submittingEntity.name (keep existing)
      // 1.3a - submittingEntity.code (set as required)
      const submittingEntityCodeControl = submittingEntityGroup.get('code');
      if (submittingEntityCodeControl) {
        submittingEntityCodeControl.setValidators([Validators.required, Validators.maxLength(32767)]);
        submittingEntityCodeControl.updateValueAndValidity();
      }
    }

    // Clear ALL validators from affected entities EXCEPT affectedEntityType for first entity
    const affectedEntitiesArray = this.incidentForm.get('affectedEntity') as FormArray;
    if (affectedEntitiesArray) {
      affectedEntitiesArray.controls.forEach((control, index) => {
        const group = control as FormGroup;
        Object.keys(group.controls).forEach(key => {
          const fieldControl = group.get(key);
          if (fieldControl) {
            fieldControl.clearValidators();
            fieldControl.updateValueAndValidity();
          }
        });
        
        // 1.4 - Set required only for affectedEntityType of first affected entity
        if (index === 0) {
          const affectedEntityTypeControl = group.get('affectedEntityType');
          if (affectedEntityTypeControl) {
            affectedEntityTypeControl.setValidators([Validators.required]);
            affectedEntityTypeControl.updateValueAndValidity();
          }
        }
      });
    }

    // Clear ALL validators from primary and secondary contacts
    const primaryContactGroup = this.incidentForm.get('primaryContact') as FormGroup;
    if (primaryContactGroup) {
      Object.keys(primaryContactGroup.controls).forEach(key => {
        const control = primaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    const secondaryContactGroup = this.incidentForm.get('secondaryContact') as FormGroup;
    if (secondaryContactGroup) {
      Object.keys(secondaryContactGroup.controls).forEach(key => {
        const control = secondaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }

    // Clear ALL validators from ultimate parent undertaking
    const ultimateParentGroup = this.incidentForm.get('ultimateParentUndertaking') as FormGroup;
    if (ultimateParentGroup) {
      ultimateParentGroup.clearValidators();
      Object.keys(ultimateParentGroup.controls).forEach(key => {
        const control = ultimateParentGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
      ultimateParentGroup.updateValueAndValidity();
    }

    // 2.1 and 2.10 - handled in incident details form
    const incidentDetailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
    if (incidentDetailsForm) {
      // Clear ALL validators first
      Object.keys(incidentDetailsForm.controls).forEach(key => {
        const control = incidentDetailsForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
      
      // Set required only for 2.1 and 2.10
      const financialEntityCodeControl = incidentDetailsForm.get('financialEntityCode');
      if (financialEntityCodeControl) {
        financialEntityCodeControl.setValidators([Validators.required, Validators.maxLength(32767)]);
        financialEntityCodeControl.updateValueAndValidity();
      }
      
      const otherInformationControl = incidentDetailsForm.get('otherInformation');
      if (otherInformationControl) {
        otherInformationControl.setValidators([Validators.required]);
        otherInformationControl.updateValueAndValidity();
      }
    }
    
    // Clear ALL validators from impact assessment and reporting forms
    const impactForm = this.impactAssessmentComponent?.impactForm;
    if (impactForm) {
      Object.keys(impactForm.controls).forEach(key => {
        const control = impactForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    const reportingForm = this.reportingToOtherAuthoritiesComponent?.reportingForm;
    if (reportingForm) {
      Object.keys(reportingForm.controls).forEach(key => {
        const control = reportingForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }

    // Clear validators from other main form fields
    const fieldsToKeepValidators = ['incidentSubmissionDetails', 'submittingEntity', 'affectedEntity'];
    Object.keys(this.incidentForm.controls).forEach(key => {
      if (!fieldsToKeepValidators.includes(key)) {
        const control = this.incidentForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    });
  }

  /**
   * Clear all validators from main form except the incident submission details
   */
  private clearAllValidatorsExceptRequired(): void {
    // Clear validators from affected entities
    const affectedEntitiesArray = this.incidentForm.get('affectedEntity') as FormArray;
    if (affectedEntitiesArray) {
      affectedEntitiesArray.controls.forEach(control => {
        const group = control as FormGroup;
        Object.keys(group.controls).forEach(key => {
          const fieldControl = group.get(key);
          if (fieldControl) {
            fieldControl.clearValidators();
            fieldControl.updateValueAndValidity();
          }
        });
      });
    }
    
    // Clear validators from ultimate parent undertaking
    const ultimateParentGroup = this.incidentForm.get('ultimateParentUndertaking') as FormGroup;
    if (ultimateParentGroup) {
      ultimateParentGroup.clearValidators();
      Object.keys(ultimateParentGroup.controls).forEach(key => {
        const control = ultimateParentGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
      ultimateParentGroup.updateValueAndValidity();
    }
    
    // Clear validators from primary and secondary contacts
    const primaryContactGroup = this.incidentForm.get('primaryContact') as FormGroup;
    if (primaryContactGroup) {
      Object.keys(primaryContactGroup.controls).forEach(key => {
        const control = primaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    const secondaryContactGroup = this.incidentForm.get('secondaryContact') as FormGroup;
    if (secondaryContactGroup) {
      Object.keys(secondaryContactGroup.controls).forEach(key => {
        const control = secondaryContactGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
    
    // Clear validators from other main form fields
    const fieldsToKeepValidators = ['incidentSubmissionDetails'];
    Object.keys(this.incidentForm.controls).forEach(key => {
      if (!fieldsToKeepValidators.includes(key) && key !== 'submittingEntity') {
        const control = this.incidentForm.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    });
  }

  /**
   * Restore normal validators for all incident types except Major Incident Reclassified as Non-Major
   */
  private restoreNormalValidators(): void {
    // Restore validators for incident submission details (including Report Currency 1.15)
    const incidentSubmissionGroup = this.incidentForm.get('incidentSubmissionDetails') as FormGroup;
    if (incidentSubmissionGroup) {
      const reportCurrencyControl = incidentSubmissionGroup.get('reportCurrency');
      if (reportCurrencyControl) {
        reportCurrencyControl.setValidators([Validators.required]);
        reportCurrencyControl.updateValueAndValidity();
      }
    }

    // Restore validators for submittingEntity
    const submittingEntityGroup = this.incidentForm.get('submittingEntity') as FormGroup;
    if (submittingEntityGroup) {
      // Restore group validator (codeOrLeiRequiredValidator)
      submittingEntityGroup.setValidators([IncidentReportFormComponent.codeOrLeiRequiredValidator]);
      submittingEntityGroup.updateValueAndValidity();
      
      // Restore LEI field pattern validator
      const leiControl = submittingEntityGroup.get('LEI');
      if (leiControl) {
        leiControl.setValidators([Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]);
        leiControl.updateValueAndValidity();
      }
      
      // Clear required validator from code (since either code or LEI is required)
      const codeControl = submittingEntityGroup.get('code');
      if (codeControl) {
        codeControl.setValidators([Validators.maxLength(32767)]);
        codeControl.updateValueAndValidity();
      }
    }

    // Restore validators for affected entities
    const affectedEntitiesArray = this.incidentForm.get('affectedEntity') as FormArray;
    if (affectedEntitiesArray) {
      affectedEntitiesArray.controls.forEach(control => {
        const group = control as FormGroup;
        
        // Restore LEI required and pattern validators
        const leiControl = group.get('LEI');
        if (leiControl) {
          leiControl.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]);
          leiControl.updateValueAndValidity();
        }
      });
    }

    // Restore validators for primary and secondary contacts
    const primaryContactGroup = this.incidentForm.get('primaryContact') as FormGroup;
    if (primaryContactGroup) {
      const nameControl = primaryContactGroup.get('name');
      const emailControl = primaryContactGroup.get('email');
      const phoneControl = primaryContactGroup.get('phone');
      
      if (nameControl) {
        nameControl.setValidators([Validators.required, Validators.maxLength(32767)]);
        nameControl.updateValueAndValidity();
      }
      if (emailControl) {
        emailControl.setValidators([Validators.required, Validators.email]);
        emailControl.updateValueAndValidity();
      }
      if (phoneControl) {
        phoneControl.setValidators([Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{7,15}$/)]);
        phoneControl.updateValueAndValidity();
      }
    }
    
    const secondaryContactGroup = this.incidentForm.get('secondaryContact') as FormGroup;
    if (secondaryContactGroup) {
      const nameControl = secondaryContactGroup.get('name');
      const emailControl = secondaryContactGroup.get('email');
      const phoneControl = secondaryContactGroup.get('phone');
      
      if (nameControl) {
        nameControl.setValidators([Validators.required, Validators.maxLength(32767)]);
        nameControl.updateValueAndValidity();
      }
      if (emailControl) {
        emailControl.setValidators([Validators.required, Validators.email]);
        emailControl.updateValueAndValidity();
      }
      if (phoneControl) {
        phoneControl.setValidators([Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{7,15}$/)]);
        phoneControl.updateValueAndValidity();
      }
    }

    // Clear validators from ultimate parent undertaking (not required for normal types)
    const ultimateParentGroup = this.incidentForm.get('ultimateParentUndertaking') as FormGroup;
    if (ultimateParentGroup) {
      const nameControl = ultimateParentGroup.get('name');
      const leiControl = ultimateParentGroup.get('LEI');
      
      if (nameControl) {
        nameControl.setValidators([Validators.maxLength(32767)]);
        nameControl.updateValueAndValidity();
      }
      if (leiControl) {
        leiControl.setValidators([Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]);
        leiControl.updateValueAndValidity();
      }
    }
  }
}

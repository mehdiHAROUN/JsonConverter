import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IncidentDetailsFormComponent } from '../incident-details-form/incident-details-form.component';
import { ImpactAssessmentComponent } from '../impact-assessment/impact-assessment.component';
import { ReportingToOtherAuthoritiesComponent } from '../reporting-to-other-authorities/reporting-to-other-authorities.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    IncidentDetailsFormComponent,
    ImpactAssessmentComponent,
    ReportingToOtherAuthoritiesComponent
  ],
  templateUrl: './incident-report-form.component.html',
  styleUrl: './incident-report-form.component.scss'
})
export class IncidentReportFormComponent implements OnInit, OnDestroy {
  incidentForm: FormGroup;
  incidentSubmissionTypes = Object.values(IncidentSubmissionType);
  reportCurrencies = REPORT_CURRENCIES;
  affectedEntityTypeOptions: { value: string; label: string }[] = [];
  private destroy$ = new Subject<void>();
  formSubmitted = false;
  IncidentSubmissionType = IncidentSubmissionType;
  AffectedEntityType = AffectedEntityType;
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

  constructor(private fb: FormBuilder) {
    // Initialize affected entity type options
    this.affectedEntityTypeOptions = Object.values(AffectedEntityType).map(value => ({
      value: value,
      label: this.formatAffectedEntityTypeLabel(value)
    }));

    this.incidentForm = this.fb.group({
      incidentSubmissionDetails: this.fb.group({
        incidentSubmission: ['', Validators.required],
        reportCurrency: ['', Validators.required]
      }),
      // --- Entity Information ---
      submittingEntity: this.fb.group({
        name: ['', Validators.maxLength(32767)],
        code: ['', Validators.maxLength(32767)],
        LEI: ['', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
        entityType: ['SUBMITTING_ENTITY']
      }, { validators: IncidentReportFormComponent.codeOrLeiRequiredValidator }),
      affectedEntity: this.fb.array([
        this.fb.group({
          name: ['', Validators.maxLength(32767)],
          LEI: ['', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
          affectedEntityType: [[]], // optional multi-select
          entityType: ['AFFECTED_ENTITY']
        })
      ]),
      ultimateParentUndertaking: this.fb.group({
        name: ['', Validators.maxLength(32767)],
        LEI: ['', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
        entityType: ['ULTIMATE_PARENT_UNDERTAKING_ENTITY']
      }, { validators: IncidentReportFormComponent.leiRequiredValidator }),
      // --- End Entity Information ---
      // --- Contact Information ---
      primaryContact: this.fb.group({
        name: ['', Validators.maxLength(32767)],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(PHONE_REGEX)]]
      }),
      secondaryContact: this.fb.group({
        name: ['', Validators.maxLength(32767)],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(PHONE_REGEX)]]
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
    this.incidentForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Form value changed:', value);
      });
  }

  ngAfterViewInit(): void {
    const detailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
    const impactForm = this.impactAssessmentComponent?.impactForm;

    if (detailsForm && impactForm) {
      detailsForm.get('classificationCriterion')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((criteria: string[]) => {
          const reputationalImpactControl = impactForm.get('reputationalImpactType');
          const reputationalImpactDescriptionControl = impactForm.get('reputationalImpactDescription');
          if (criteria && criteria.includes('reputational_impact')) {
            reputationalImpactControl?.setValidators([Validators.required]);
            reputationalImpactDescriptionControl?.setValidators([Validators.required]);
          } else {
            reputationalImpactControl?.clearValidators();
            reputationalImpactDescriptionControl?.clearValidators();
          }
          reputationalImpactControl?.updateValueAndValidity();
          reputationalImpactDescriptionControl?.updateValueAndValidity();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    const f = this.incidentForm;
    const incidentSubmissionType = f.get('incidentSubmissionDetails.incidentSubmission')?.value;
    const detailsForm = this.incidentDetailsFormComponent?.incidentDetailsForm;
    const impactForm = this.impactAssessmentComponent?.impactForm;
    const reportingForm = this.reportingToOtherAuthoritiesComponent?.reportingForm;
    const details = detailsForm?.value;
    const impact = impactForm?.value;
    const reporting = reportingForm?.value;
    const missingFields: string[] = [];

    // Section 1 validation (same as before)
    if (!f.get('incidentSubmissionDetails.incidentSubmission')?.value) missingFields.push('1.1 Incident Submission Type');
    if (!f.get('incidentSubmissionDetails.reportCurrency')?.value) missingFields.push('1.15 Report Currency');
    if (!f.get('submittingEntity.name')?.value) missingFields.push('1.2 Submitting Entity Name');
    const code = f.get('submittingEntity.code')?.value;
    const lei = f.get('submittingEntity.LEI')?.value;
    if (!code && !lei) missingFields.push('1.3a or 1.3b: At least one of Submitting Entity Code or LEI');
    const affectedEntities = f.get('affectedEntity') as FormArray;
    if (affectedEntities && affectedEntities.length > 0) {
      affectedEntities.controls.forEach((ctrl, i) => {
        if (!ctrl.get('affectedEntityType')?.value?.length) missingFields.push(`1.4 Affected Entity Type (row ${i+1})`);
        if (!ctrl.get('name')?.value) missingFields.push(`1.5 Affected Entity Name (row ${i+1})`);
        if (!ctrl.get('LEI')?.value) missingFields.push(`1.6 Affected Entity LEI (row ${i+1})`);
      });
    }
    if (!f.get('primaryContact.name')?.value) missingFields.push('1.7 Primary Contact Name');
    if (!f.get('primaryContact.email')?.value || f.get('primaryContact.email')?.invalid) missingFields.push('1.8 Primary Contact Email (required/valid)');
    if (!f.get('primaryContact.phone')?.value) missingFields.push('1.9 Primary Contact Phone');
    if (!f.get('secondaryContact.name')?.value) missingFields.push('1.10 Secondary Contact Name');
    if (!f.get('secondaryContact.email')?.value || f.get('secondaryContact.email')?.invalid) missingFields.push('1.11 Secondary Contact Email (required/valid)');
    if (!f.get('secondaryContact.phone')?.value) missingFields.push('1.12 Secondary Contact Phone');
    if (!f.get('ultimateParentUndertaking.name')?.value) missingFields.push('1.13 Ultimate Parent Undertaking Name');
    if (!f.get('ultimateParentUndertaking.LEI')?.value) missingFields.push('1.14 Ultimate Parent Undertaking LEI');

    // Section 2 validation (same as before)
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
      if (!detailsForm.get('originatesFromThirdPartyProvider')?.value) missingFields.push('2.8 Originates From Third Party Provider');
      if (detailsForm.get('isBusinessContinuityActivated')?.value === null || detailsForm.get('isBusinessContinuityActivated')?.value === undefined) missingFields.push('2.9 Is Business Continuity Activated');
      if (!detailsForm.get('otherInformation')?.value) missingFields.push('2.10 Other Information');
    }

    // Section 3 validation (for intermediate_report and final_report)
    if (incidentSubmissionType === 'intermediate_report' || incidentSubmissionType === 'final_report') {
      if (!impactForm) {
        missingFields.push('Section 3: Impact Assessment form is missing');
      } else {
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
        
        const classificationCriteria = detailsForm.get('classificationCriterion')?.value || [];
        const isReputationalImpactChecked = classificationCriteria.includes('reputational_impact');
        if (isReputationalImpactChecked && (!impactForm.get('reputationalImpactType')?.value || impactForm.get('reputationalImpactType')?.value.length === 0)) {
          missingFields.push('3.13 Reputational Impact Type');
        }

        if (isReputationalImpactChecked && !impactForm.get('reputationalImpactDescription')?.value) {
          missingFields.push('3.14 Reputational Impact Description');
        }

        if (!impactForm.get('incidentDuration')?.value) missingFields.push('3.15 Incident Duration (DD:HH:MM)');
        if (!impactForm.get('serviceDowntime')?.value) missingFields.push('3.16 Service Downtime (DD:HH:MM)');
        if (!impactForm.get('informationDurationServiceDowntimeActualOrEstimate')?.value) missingFields.push('3.17 Duration and Downtime Information Type');
        if (!impactForm.get('memberStatesImpactType')?.value || impactForm.get('memberStatesImpactType')?.value.length === 0) missingFields.push('3.18 Types of Impact in Member States');
        if (!impactForm.get('memberStatesImpactTypeDescription')?.value) missingFields.push('3.19 Member States Impact Type Description');
        if (!impactForm.get('dataLosseMaterialityThresholds')?.value || impactForm.get('dataLosseMaterialityThresholds')?.value.length === 0) missingFields.push('3.20 Materiality Thresholds for Data Losses');
        if (!impactForm.get('dataLossesDescription')?.value) missingFields.push('3.21 Data Losses Description');
        if (!impactForm.get('criticalServicesAffected')?.value) missingFields.push('3.22 Critical Services Affected');
        if (!impactForm.get('IncidentType')?.value || impactForm.get('IncidentType')?.value.length === 0) missingFields.push('3.23 Type of the Major ICT-related Incident');
        if (!impactForm.get('otherIncidentClassification')?.value) missingFields.push('3.24 Other Incident Classification');
        if (!impactForm.get('threatTechniques')?.value || impactForm.get('threatTechniques')?.value.length === 0) missingFields.push('3.25 Threats and Techniques Used by Threat Actor');
        if (!impactForm.get('otherThreatTechniques')?.value) missingFields.push('3.26 Other Threat Techniques');
        if (!impactForm.get('affectedFunctionalAreas')?.value) missingFields.push('3.27 Affected Functional Areas');
        if (!impactForm.get('isAffectedInfrastructureComponents')?.value) missingFields.push('3.28 Is Infrastructure Components Affected');
        if (!impactForm.get('affectedInfrastructureComponents')?.value) missingFields.push('3.29 Affected Infrastructure Components');
        if (!impactForm.get('isImpactOnFinancialInterest')?.value) missingFields.push('3.30 Impact on Financial Interest of Clients');
        if (!impactForm.get('reportingToOtherAuthorities')?.value || impactForm.get('reportingToOtherAuthorities')?.value.length === 0) missingFields.push('3.31 Reporting to Other Authorities');
        if (!impactForm.get('reportingToOtherAuthoritiesOther')?.value) missingFields.push('3.32 Other Authorities Description');
        if (impactForm.get('isTemporaryActionsMeasuresForRecovery')?.value === null || impactForm.get('isTemporaryActionsMeasuresForRecovery')?.value === undefined) missingFields.push('3.33 Temporary Actions or Measures for Recovery');
        if (!impactForm.get('descriptionOfTemporaryActionsMeasuresForRecovery')?.value) missingFields.push('3.34 Description of Temporary Actions/Measures');
        if (!impactForm.get('indicatorsOfCompromise')?.value) missingFields.push('3.35 Indicators of Compromise');
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
        if (!reportingForm.get('rootCausesOther')?.value) missingFields.push('4.4 Other Root Causes');
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
        if (!reportingForm.get('occurrenceOfRecurringIncidentsDate')?.value || !reportingForm.get('occurrenceOfRecurringIncidentsTime')?.value) missingFields.push('4.16 Occurrence of Recurring Incidents Date & Time');
      }
    }

    // Only allow file generation if all required fields are filled/valid
    if (missingFields.length > 0) {
      this.markFormGroupTouched(this.incidentForm);
      if (detailsForm) this.markFormGroupTouched(detailsForm);
      if (impactForm) this.markFormGroupTouched(impactForm);
      if (reportingForm) this.markFormGroupTouched(reportingForm);
      alert('Please fill in the following required fields:\n' + missingFields.join('\n'));
      return;
    }

    // Data extraction for JSON
    const section1 = {
      incidentSubmission: f.value.incidentSubmissionDetails?.incidentSubmission,
      reportCurrency: f.value.incidentSubmissionDetails?.reportCurrency,
      submittingEntity: {
        name: f.value.submittingEntity?.name,
        code: f.value.submittingEntity?.code,
        LEI: f.value.submittingEntity?.LEI
      },
      affectedEntity: (f.value.affectedEntity || []).map((entity: any) => ({
        affectedEntityType: entity.affectedEntityType,
        name: entity.name,
        LEI: entity.LEI
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
      },
      ultimateParentUndertaking: {
        name: f.value.ultimateParentUndertaking?.name,
        LEI: f.value.ultimateParentUndertaking?.LEI
      }
    };
    const section2 = details ? {
      financialEntityCode: details.financialEntityCode,
      detectionDate: details.detectionDate,
      detectionTime: details.detectionTime,
      classificationDate: details.classificationDate,
      classificationTime: details.classificationTime,
      incidentDescription: details.incidentDescription,
      classificationCriterion: details.classificationCriterion,
      countryCodeMaterialityThresholds: details.countryCodeMaterialityThresholds,
      incidentDiscovery: details.incidentDiscovery,
      originatesFromThirdPartyProvider: details.originatesFromThirdPartyProvider,
      isBusinessContinuityActivated: details.isBusinessContinuityActivated,
      otherInformation: details.otherInformation
    } : {};
    const section3 = impact ? {
      competentAuthorityCode: impact.competentAuthorityCode,
      occurrenceDate: impact.occurrenceDate,
      occurrenceTime: impact.occurrenceTime,
      recoveryDate: impact.recoveryDate,
      recoveryTime: impact.recoveryTime,
      number: impact.number,
      percentage: impact.percentage,
      numberOfFinancialCounterpartsAffected: impact.numberOfFinancialCounterpartsAffected,
      percentageOfFinancialCounterpartsAffected: impact.percentageOfFinancialCounterpartsAffected,
      hasImpactOnRelevantClients: impact.hasImpactOnRelevantClients,
      numberOfAffectedTransactions: impact.numberOfAffectedTransactions,
      percentageOfAffectedTransactions: impact.percentageOfAffectedTransactions,
      valueOfAffectedTransactions: impact.valueOfAffectedTransactions,
      numbersActualEstimate: impact.numbersActualEstimate,
      reputationalImpactType: impact.reputationalImpactType,
      reputationalImpactDescription: impact.reputationalImpactDescription,
      incidentDuration: impact.incidentDuration,
      serviceDowntime: impact.serviceDowntime,
      informationDurationServiceDowntimeActualOrEstimate: impact.informationDurationServiceDowntimeActualOrEstimate,
      memberStatesImpactType: impact.memberStatesImpactType,
      memberStatesImpactTypeDescription: impact.memberStatesImpactTypeDescription,
      dataLosseMaterialityThresholds: impact.dataLosseMaterialityThresholds,
      dataLossesDescription: impact.dataLossesDescription,
      criticalServicesAffected: impact.criticalServicesAffected,
      IncidentType: impact.IncidentType,
      otherIncidentClassification: impact.otherIncidentClassification,
      threatTechniques: impact.threatTechniques,
      otherThreatTechniques: impact.otherThreatTechniques,
      affectedFunctionalAreas: impact.affectedFunctionalAreas,
      isAffectedInfrastructureComponents: impact.isAffectedInfrastructureComponents,
      affectedInfrastructureComponents: impact.affectedInfrastructureComponents,
      isImpactOnFinancialInterest: impact.isImpactOnFinancialInterest,
      reportingToOtherAuthorities: impact.reportingToOtherAuthorities,
      reportingToOtherAuthoritiesOther: impact.reportingToOtherAuthoritiesOther,
      isTemporaryActionsMeasuresForRecovery: impact.isTemporaryActionsMeasuresForRecovery,
      descriptionOfTemporaryActionsMeasuresForRecovery: impact.descriptionOfTemporaryActionsMeasuresForRecovery,
      indicatorsOfCompromise: impact.indicatorsOfCompromise
    } : {};
    const section4 = reporting ? {
      rootCauseHLClassification: reporting.rootCauseHLClassification,
      rootCausesDetailedClassification: reporting.rootCausesDetailedClassification,
      rootCausesAdditionalClassification: reporting.rootCausesAdditionalClassification,
      rootCausesOther: reporting.rootCausesOther,
      rootCausesInformation: reporting.rootCausesInformation,
      incidentResolutionSummary: reporting.incidentResolutionSummary,
      incidentRootCauseAddressedDate: reporting.incidentRootCauseAddressedDate,
      incidentRootCauseAddressedTime: reporting.incidentRootCauseAddressedTime,
      rootCauseAddressingDateTime: reporting.rootCauseAddressingDateTime,
      incidentWasResolvedDate: reporting.incidentWasResolvedDate,
      incidentWasResolvedTime: reporting.incidentWasResolvedTime,
      incidentResolutionDateTime: reporting.incidentResolutionDateTime,
      incidentResolutionVsPlannedImplementation: reporting.incidentResolutionVsPlannedImplementation,
      assessmentOfRiskToCriticalFunctions: reporting.assessmentOfRiskToCriticalFunctions,
      informationRelevantToResolutionAuthorities: reporting.informationRelevantToResolutionAuthorities,
      economicImpactMaterialityThreshold: reporting.economicImpactMaterialityThreshold,
      grossAmountIndirectDirectCosts: reporting.grossAmountIndirectDirectCosts,
      financialRecoveriesAmount: reporting.financialRecoveriesAmount,
      recurringNonMajorIncidentsDescription: reporting.recurringNonMajorIncidentsDescription,
      occurrenceOfRecurringIncidentsDate: reporting.occurrenceOfRecurringIncidentsDate,
      occurrenceOfRecurringIncidentsTime: reporting.occurrenceOfRecurringIncidentsTime,
      recurringIncidentsOccurrenceDateTime: reporting.recurringIncidentsOccurrenceDateTime
    } : {};

    // File generation logic
    if (incidentSubmissionType === 'final_report') {
      this.downloadJson({ section1, section2, section3, section4 }, 'section1-section2-section3-section4-final-report.json');
    } else if (incidentSubmissionType === 'intermediate_report') {
      this.downloadJson({ section1, section2, section3 }, 'section1-section2-section3-intermediate-report.json');
    } else if (incidentSubmissionType === 'initial_notification') {
      this.downloadJson({ section1, section2 }, 'section1-section2-entity-information.json');
    }
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

  get affectedEntity(): FormArray {
    return this.incidentForm.get('affectedEntity') as FormArray;
  }

  addAffectedEntity(): void {
    this.affectedEntity.push(this.fb.group({
      name: [''],
      LEI: ['', [Validators.pattern(/^[A-Z0-9]{18}[0-9]{2}$/)]],
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
}

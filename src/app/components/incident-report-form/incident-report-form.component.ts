import { Component, OnInit, OnDestroy } from '@angular/core';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.incidentForm.valid) {
      const formData: IncidentFormData = this.incidentForm.value;
      console.log('Form submitted:', formData);
      this.resetForm();
    } else {
      this.markFormGroupTouched(this.incidentForm);
    }
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

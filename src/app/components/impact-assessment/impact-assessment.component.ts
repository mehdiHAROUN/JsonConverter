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

// Service Impact interface - RETAINED FOR NOW, MIGHT BE REPLACED/MERGED
interface ServiceImpact {
  serviceDowntime: string; // HH:MM:SS format
  serviceRestorationDateTime: Date;
  isTemporaryActionsMeasuresForRecovery: boolean;
  descriptionOfTemporaryActionsMeasuresForRecovery: string;
}

// Affected Assets interface - RETAINED FOR NOW, MIGHT BE REPLACED/MERGED
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

// Main Impact Assessment interface - TO BE REVISED
export interface ImpactAssessment {
  // Old fields - will be removed or integrated into new structure
  // hasImpactOnRelevantClients: boolean;
  // serviceImpact: ServiceImpact;
  // criticalServicesAffected: string; // This seems to be 3.1.1a
  // affectedAssets: AffectedAssets;
  // affectedFunctionalAreas: string; // This seems to be 3.2.2 or 3.2.3
  // isAffectedInfrastructureComponents: string; // This seems to be part of an older structure
  // affectedInfrastructureComponents: string; // This seems to be part of an older structure
  // isImpactOnFinancialInterest: string; // This seems to be 3.7.x

  // New structure based on schema
  servicesAffected?: { // 3.1
    isCriticalServiceAffected: boolean | null;
    criticalServicesAffectedDescription: string | null;
    nonCriticalServicesAffectedDescription: string | null;
    serviceDowntimeInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    serviceDowntime: string | null; // HH:MM:SS
    serviceRestorationDateTimeInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    serviceRestorationDateTime: Date | string | null; // Allow string for input, convert to Date
    isTemporaryActionsMeasuresForRecovery: boolean | null;
    descriptionOfTemporaryActionsMeasuresForRecovery: string | null;
  };
  functionsAffected?: { // 3.2
    isCriticalFunctionAffected: boolean | null;
    criticalFunctionsAffectedDescription: string | null;
    nonCriticalFunctionsAffectedDescription: string | null;
  };
  counterpartiesAffected?: { // 3.3
    numberOfClientsAffected: number | null;
    clientsAffectedInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    numberOfFinancialCounterpartsAffected: number | null;
    financialCounterpartsAffectedInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    numberOfTransactionsAffected: number | null;
    transactionsAffectedInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    valueOfTransactionsAffected: number | null;
    valueOfTransactionsAffectedCurrency: string | null; // Assuming EUR from schema, but could be dynamic
    valueOfTransactionsAffectedInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
  };
  geographicalImpact?: { // 3.4
    memberStatesAffected: string[] | null; // Assuming multiple selection
    thirdCountriesAffected: string[] | null; // Assuming multiple selection
  };
  dataLoss?: { // 3.5
    isDataLost: boolean | null;
    dataLostDescription: string | null;
    isDataCompromised: boolean | null;
    dataCompromisedDescription: string | null;
    isDataBreached: boolean | null;
    dataBreachedDescription: string | null;
    isConfidentialityAffected: boolean | null;
    confidentialityAffectedDescription: string | null;
    isIntegrityAffected: boolean | null;
    integrityAffectedDescription: string | null;
    isAvailabilityAffected: boolean | null;
    availabilityAffectedDescription: string | null;
  };
  economicImpact?: { // 3.6
    directCosts: number | null;
    indirectCosts: number | null;
    totalAmount: number | null;
    economicImpactCurrency: string | null; // Assuming EUR
    economicImpactInformationType: 'actual' | 'estimated' | 'not_applicable' | null;
    economicImpactDescription: string | null;
  };
  reputationalImpact?: { // 3.7
    isNegativeMediaCoverage: boolean | null;
    negativeMediaCoverageDescription: string | null;
    isComplaintsFromClients: boolean | null;
    complaintsFromClientsDescription: string | null;
    isComplaintsFromOtherStakeholders: boolean | null;
    complaintsFromOtherStakeholdersDescription: string | null;
    isOtherReputationalImpact: boolean | null;
    otherReputationalImpactDescription: string | null;
  };
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

  readonly MAX_TEXT_LENGTH = 32767; // As per schema
  readonly NACE_CODE_LENGTH = 5; // As per schema for NACE codes (though not directly in this component)
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
      // Percentage can be null if not applicable, so only validate if a value is present
      return (value >= 0 && value <= 100) ? null : { invalidPercentage: true };
    };
  }

  constructor(private fb: FormBuilder) {
    // Define form groups for each section of the schema

    const servicesAffectedGroup = this.fb.group({ // 3.1
      isCriticalServiceAffected: [null as boolean | null],
      criticalServicesAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      nonCriticalServicesAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      serviceDowntimeInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      serviceDowntime: ['', [ImpactAssessmentComponent.timeFormatValidator(), Validators.maxLength(8)]], // HH:MM:SS
      serviceRestorationDateTimeInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      serviceRestorationDateTime: [null as Date | string | null],
      isTemporaryActionsMeasuresForRecovery: [null as boolean | null],
      descriptionOfTemporaryActionsMeasuresForRecovery: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)]
    });

    const functionsAffectedGroup = this.fb.group({ // 3.2
      isCriticalFunctionAffected: [null as boolean | null],
      criticalFunctionsAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      nonCriticalFunctionsAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)]
    });

    const counterpartiesAffectedGroup = this.fb.group({ // 3.3
      numberOfClientsAffected: [null as number | null, Validators.min(0)],
      clientsAffectedInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      numberOfFinancialCounterpartsAffected: [null as number | null, Validators.min(0)],
      financialCounterpartsAffectedInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      numberOfTransactionsAffected: [null as number | null, Validators.min(0)],
      transactionsAffectedInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      valueOfTransactionsAffected: [null as number | null, Validators.min(0)],
      valueOfTransactionsAffectedCurrency: ['EUR'], // Default or make selectable
      valueOfTransactionsAffectedInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null]
    });

    const geographicalImpactGroup = this.fb.group({ // 3.4
      memberStatesAffected: [[] as string[] | null], // Assuming array for multi-select
      thirdCountriesAffected: [[] as string[] | null]  // Assuming array for multi-select
    });

    const dataLossGroup = this.fb.group({ // 3.5
      isDataLost: [null as boolean | null],
      dataLostDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isDataCompromised: [null as boolean | null],
      dataCompromisedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isDataBreached: [null as boolean | null],
      dataBreachedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isConfidentialityAffected: [null as boolean | null],
      confidentialityAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isIntegrityAffected: [null as boolean | null],
      integrityAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isAvailabilityAffected: [null as boolean | null],
      availabilityAffectedDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)]
    });

    const economicImpactGroup = this.fb.group({ // 3.6
      directCosts: [null as number | null, Validators.min(0)],
      indirectCosts: [null as number | null, Validators.min(0)],
      totalAmount: [null as number | null, Validators.min(0)], // This might be auto-calculated
      economicImpactCurrency: ['EUR'], // Default or make selectable
      economicImpactInformationType: [null as 'actual' | 'estimated' | 'not_applicable' | null],
      economicImpactDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)]
    });

    const reputationalImpactGroup = this.fb.group({ // 3.7
      isNegativeMediaCoverage: [null as boolean | null],
      negativeMediaCoverageDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isComplaintsFromClients: [null as boolean | null],
      complaintsFromClientsDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isComplaintsFromOtherStakeholders: [null as boolean | null],
      complaintsFromOtherStakeholdersDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)],
      isOtherReputationalImpact: [null as boolean | null],
      otherReputationalImpactDescription: ['', Validators.maxLength(this.MAX_TEXT_LENGTH)]
    });

    // Create the main form group using the new structure
    this.impactForm = this.fb.group({
      servicesAffected: servicesAffectedGroup,
      functionsAffected: functionsAffectedGroup,
      counterpartiesAffected: counterpartiesAffectedGroup,
      geographicalImpact: geographicalImpactGroup,
      dataLoss: dataLossGroup,
      economicImpact: economicImpactGroup,
      reputationalImpact: reputationalImpactGroup
    });

    // Set up conditional validation based on schema requirements
    // Example: if isCriticalServiceAffected is true, criticalServicesAffectedDescription is required
    this.impactForm.get('servicesAffected.isCriticalServiceAffected')?.valueChanges.subscribe(isCritical => {
      const control = this.impactForm.get('servicesAffected.criticalServicesAffectedDescription');
      if (isCritical) {
        control?.setValidators([Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)]);
      } else {
        control?.setValidators(Validators.maxLength(this.MAX_TEXT_LENGTH));
        control?.setValue(''); // Clear value if not critical
      }
      control?.updateValueAndValidity();
    });
    
    // Similar conditional validation for other boolean flags and their descriptions
    this.setupConditionalValidation('servicesAffected.isTemporaryActionsMeasuresForRecovery', 'servicesAffected.descriptionOfTemporaryActionsMeasuresForRecovery');
    this.setupConditionalValidation('functionsAffected.isCriticalFunctionAffected', 'functionsAffected.criticalFunctionsAffectedDescription');
    this.setupConditionalValidation('dataLoss.isDataLost', 'dataLoss.dataLostDescription');
    this.setupConditionalValidation('dataLoss.isDataCompromised', 'dataLoss.dataCompromisedDescription');
    this.setupConditionalValidation('dataLoss.isDataBreached', 'dataLoss.dataBreachedDescription');
    this.setupConditionalValidation('dataLoss.isConfidentialityAffected', 'dataLoss.confidentialityAffectedDescription');
    this.setupConditionalValidation('dataLoss.isIntegrityAffected', 'dataLoss.integrityAffectedDescription');
    this.setupConditionalValidation('dataLoss.isAvailabilityAffected', 'dataLoss.availabilityAffectedDescription');
    this.setupConditionalValidation('reputationalImpact.isNegativeMediaCoverage', 'reputationalImpact.negativeMediaCoverageDescription');
    this.setupConditionalValidation('reputationalImpact.isComplaintsFromClients', 'reputationalImpact.complaintsFromClientsDescription');
    this.setupConditionalValidation('reputationalImpact.isComplaintsFromOtherStakeholders', 'reputationalImpact.complaintsFromOtherStakeholdersDescription');
    this.setupConditionalValidation('reputationalImpact.isOtherReputationalImpact', 'reputationalImpact.otherReputationalImpactDescription');


    // Conditional validation for serviceDowntime based on serviceDowntimeInformationType
    this.impactForm.get('servicesAffected.serviceDowntimeInformationType')?.valueChanges.subscribe(type => {
        const control = this.impactForm.get('servicesAffected.serviceDowntime');
        if (type && type !== 'not_applicable') {
            control?.setValidators([Validators.required, ImpactAssessmentComponent.timeFormatValidator(), Validators.maxLength(8)]);
        } else {
            control?.clearValidators();
            control?.setValidators([ImpactAssessmentComponent.timeFormatValidator(), Validators.maxLength(8)]); // Keep format validator
            control?.setValue('');
        }
        control?.updateValueAndValidity();
    });

    // Conditional validation for serviceRestorationDateTime based on serviceRestorationDateTimeInformationType
    this.impactForm.get('servicesAffected.serviceRestorationDateTimeInformationType')?.valueChanges.subscribe(type => {
        const control = this.impactForm.get('servicesAffected.serviceRestorationDateTime');
        if (type && type !== 'not_applicable') {
            control?.setValidators(Validators.required);
        } else {
            control?.clearValidators();
            control?.setValue(null);
        }
        control?.updateValueAndValidity();
    });
    
    // Conditional validation for numberOfClientsAffected
    this.impactForm.get('counterpartiesAffected.clientsAffectedInformationType')?.valueChanges.subscribe(type => {
      this.updateCounterpartyFieldValidation('counterpartiesAffected.numberOfClientsAffected', type);
    });

    // Conditional validation for numberOfFinancialCounterpartsAffected
    this.impactForm.get('counterpartiesAffected.financialCounterpartsAffectedInformationType')?.valueChanges.subscribe(type => {
      this.updateCounterpartyFieldValidation('counterpartiesAffected.numberOfFinancialCounterpartsAffected', type);
    });
    
    // Conditional validation for numberOfTransactionsAffected
    this.impactForm.get('counterpartiesAffected.transactionsAffectedInformationType')?.valueChanges.subscribe(type => {
      this.updateCounterpartyFieldValidation('counterpartiesAffected.numberOfTransactionsAffected', type);
    });

    // Conditional validation for valueOfTransactionsAffected
    this.impactForm.get('counterpartiesAffected.valueOfTransactionsAffectedInformationType')?.valueChanges.subscribe(type => {
      this.updateCounterpartyFieldValidation('counterpartiesAffected.valueOfTransactionsAffected', type);
      const currencyControl = this.impactForm.get('counterpartiesAffected.valueOfTransactionsAffectedCurrency');
      if (type && type !== 'not_applicable') {
        currencyControl?.setValidators(Validators.required);
      } else {
        currencyControl?.clearValidators();
        currencyControl?.setValue('EUR'); // Reset to default or null
      }
      currencyControl?.updateValueAndValidity();
    });

    // Conditional validation for economicImpact fields
    this.impactForm.get('economicImpact.economicImpactInformationType')?.valueChanges.subscribe(type => {
        const directCostsCtrl = this.impactForm.get('economicImpact.directCosts');
        const indirectCostsCtrl = this.impactForm.get('economicImpact.indirectCosts');
        const totalAmountCtrl = this.impactForm.get('economicImpact.totalAmount');
        const currencyCtrl = this.impactForm.get('economicImpact.economicImpactCurrency');
        const descriptionCtrl = this.impactForm.get('economicImpact.economicImpactDescription');

        if (type && type !== 'not_applicable') {
            directCostsCtrl?.setValidators([Validators.required, Validators.min(0)]);
            indirectCostsCtrl?.setValidators([Validators.required, Validators.min(0)]);
            totalAmountCtrl?.setValidators([Validators.required, Validators.min(0)]);
            currencyCtrl?.setValidators(Validators.required);
            // Description might not be strictly required if type is actual/estimated, but good to have
            descriptionCtrl?.setValidators(Validators.maxLength(this.MAX_TEXT_LENGTH));
        } else {
            directCostsCtrl?.clearValidators();
            directCostsCtrl?.setValidators(Validators.min(0));
            directCostsCtrl?.setValue(null);
            indirectCostsCtrl?.clearValidators();
            indirectCostsCtrl?.setValidators(Validators.min(0));
            indirectCostsCtrl?.setValue(null);
            totalAmountCtrl?.clearValidators();
            totalAmountCtrl?.setValidators(Validators.min(0));
            totalAmountCtrl?.setValue(null);
            currencyCtrl?.clearValidators();
            currencyCtrl?.setValue('EUR');
            descriptionCtrl?.clearValidators();
            descriptionCtrl?.setValidators(Validators.maxLength(this.MAX_TEXT_LENGTH));
            descriptionCtrl?.setValue('');
        }
        directCostsCtrl?.updateValueAndValidity();
        indirectCostsCtrl?.updateValueAndValidity();
        totalAmountCtrl?.updateValueAndValidity();
        currencyCtrl?.updateValueAndValidity();
        descriptionCtrl?.updateValueAndValidity();
    });


    // Initial validation update based on incidentSubmission type
    this.updateSubmissionTypeValidation();
  }

  private setupConditionalValidation(booleanControlPath: string, textControlPath: string): void {
    this.impactForm.get(booleanControlPath)?.valueChanges.subscribe(isChecked => {
      const control = this.impactForm.get(textControlPath);
      if (isChecked) {
        control?.setValidators([Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)]);
      } else {
        control?.setValidators(Validators.maxLength(this.MAX_TEXT_LENGTH));
        control?.setValue(''); // Clear value if checkbox is false
      }
      control?.updateValueAndValidity();
    });
  }

  private updateCounterpartyFieldValidation(controlPath: string, type: 'actual' | 'estimated' | 'not_applicable' | null): void {
    const control = this.impactForm.get(controlPath);
    if (type && type !== 'not_applicable') {
      control?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      control?.clearValidators();
      control?.setValidators(Validators.min(0)); // Keep min validator
      control?.setValue(null);
    }
    control?.updateValueAndValidity();
  }


  // Getter methods for form controls - TO BE UPDATED for new structure
  // Example for a new control:
  // get isCriticalServiceAffectedControl(): FormControl {
  //   return this.impactForm.get('servicesAffected.isCriticalServiceAffected') as FormControl;
  // }

  // OLD GETTERS - REMOVE OR UPDATE
  // get serviceDowntimeControl(): FormControl {
  //   return this.serviceImpactGroup.get('serviceDowntime') as FormControl;
  // }
  // get serviceImpactGroup(): FormGroup {
  //   return this.impactForm.get('serviceImpact') as FormGroup;
  // }
  // ... other old getters ...


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incidentSubmission']) {
      this.updateSubmissionTypeValidation();
    }
  }

  ngOnInit(): void {
    this.updateSubmissionTypeValidation();
    
    // Subscribe to form value changes to emit updates
    this.impactForm.valueChanges.subscribe(value => {
      // console.log('Impact form value:', value); // For debugging
      // console.log('Impact form validity:', this.impactForm.valid); // For debugging
      if (this.impactForm.valid) {
        this.impactAssessmentData.emit(value as ImpactAssessment);
      } else {
        // Optionally emit invalid state or handle it
        this.impactAssessmentData.emit(undefined); // Or some indicator of invalidity
      }
    });
  }

  private updateSubmissionTypeValidation(): void {
    // This method needs to be completely re-evaluated based on the new form structure
    // and the schema's requirements for different report types (initial, intermediate, final).
    // For now, let's assume most fields are optional for initial and required for final,
    // but this is a simplification and needs schema-driven logic.

    const isFinalReport = this.incidentSubmission === 'final_report';
    const isIntermediateOrFinal = this.incidentSubmission === 'intermediate_report' || isFinalReport;

    // Example: Making criticalServicesAffectedDescription required for final reports if isCriticalServiceAffected is true
    const isCriticalServiceAffectedCtrl = this.impactForm.get('servicesAffected.isCriticalServiceAffected');
    const criticalServicesDescCtrl = this.impactForm.get('servicesAffected.criticalServicesAffectedDescription');
    if (isFinalReport && isCriticalServiceAffectedCtrl?.value === true) {
      criticalServicesDescCtrl?.setValidators([Validators.required, Validators.maxLength(this.MAX_TEXT_LENGTH)]);
    } else if (isCriticalServiceAffectedCtrl?.value === true) {
      // Keep required if already set by boolean flag logic, otherwise just maxLength
       criticalServicesDescCtrl?.setValidators(criticalServicesDescCtrl?.validator ? criticalServicesDescCtrl.validator : Validators.maxLength(this.MAX_TEXT_LENGTH));
    } else {
      criticalServicesDescCtrl?.setValidators(Validators.maxLength(this.MAX_TEXT_LENGTH));
    }
    criticalServicesDescCtrl?.updateValueAndValidity();

    // Iterate over all controls and update validators based on report type
    // This is a placeholder for more detailed logic based on schema fields 1.1, 1.2
    // For example, many fields become mandatory for 'final_report'.

    // Services Affected (3.1)
    this.setRequiredValidator('servicesAffected.isCriticalServiceAffected', isIntermediateOrFinal);
    // criticalServicesAffectedDescription is handled by its own conditional logic + above
    this.setRequiredValidator('servicesAffected.nonCriticalServicesAffectedDescription', isFinalReport, true); // Optional if no non-critical
    this.setRequiredValidator('servicesAffected.serviceDowntimeInformationType', isIntermediateOrFinal);
    // serviceDowntime is handled by its conditional logic
    this.setRequiredValidator('servicesAffected.serviceRestorationDateTimeInformationType', isIntermediateOrFinal);
    // serviceRestorationDateTime is handled by its conditional logic
    this.setRequiredValidator('servicesAffected.isTemporaryActionsMeasuresForRecovery', isIntermediateOrFinal);
    // descriptionOfTemporaryActionsMeasuresForRecovery is handled by its conditional logic

    // Functions Affected (3.2)
    this.setRequiredValidator('functionsAffected.isCriticalFunctionAffected', isIntermediateOrFinal);
    // criticalFunctionsAffectedDescription handled by its conditional logic
    this.setRequiredValidator('functionsAffected.nonCriticalFunctionsAffectedDescription', isFinalReport, true); // Optional if no non-critical

    // Counterparties Affected (3.3)
    this.setRequiredValidator('counterpartiesAffected.clientsAffectedInformationType', isIntermediateOrFinal);
    // numberOfClientsAffected handled by its conditional logic
    this.setRequiredValidator('counterpartiesAffected.financialCounterpartsAffectedInformationType', isIntermediateOrFinal);
    // numberOfFinancialCounterpartsAffected handled by its conditional logic
    this.setRequiredValidator('counterpartiesAffected.transactionsAffectedInformationType', isFinalReport);
    // numberOfTransactionsAffected handled by its conditional logic
    this.setRequiredValidator('counterpartiesAffected.valueOfTransactionsAffectedInformationType', isFinalReport);
    // valueOfTransactionsAffected and currency handled by its conditional logic

    // Geographical Impact (3.4) - Assuming optional unless specified otherwise by schema for report types
    // this.setRequiredValidator('geographicalImpact.memberStatesAffected', isFinalReport);
    // this.setRequiredValidator('geographicalImpact.thirdCountriesAffected', isFinalReport);


    // Data Loss (3.5) - All boolean flags are likely required for intermediate/final
    const dataLossBooleans = [
      'isDataLost', 'isDataCompromised', 'isDataBreached',
      'isConfidentialityAffected', 'isIntegrityAffected', 'isAvailabilityAffected'
    ];
    dataLossBooleans.forEach(field => {
      this.setRequiredValidator(`dataLoss.${field}`, isIntermediateOrFinal);
      // Corresponding descriptions are handled by their conditional logic
    });

    // Economic Impact (3.6)
    this.setRequiredValidator('economicImpact.economicImpactInformationType', isIntermediateOrFinal);
    // directCosts, indirectCosts, totalAmount, currency, description handled by conditional logic

    // Reputational Impact (3.7) - All boolean flags likely required for intermediate/final
    const reputationalImpactBooleans = [
      'isNegativeMediaCoverage', 'isComplaintsFromClients',
      'isComplaintsFromOtherStakeholders', 'isOtherReputationalImpact'
    ];
    reputationalImpactBooleans.forEach(field => {
      this.setRequiredValidator(`reputationalImpact.${field}`, isIntermediateOrFinal);
      // Corresponding descriptions are handled by their conditional logic
    });
    
    this.impactForm.updateValueAndValidity();
  }

  private setRequiredValidator(controlPath: string, isRequired: boolean, allowNullOrEmptyForOptionalText: boolean = false): void {
    const control = this.impactForm.get(controlPath);
    if (control) {
      let currentValidators = control.validator ? [control.validator] : [];
      // Remove existing Validators.required if present
      currentValidators = currentValidators.filter(v => v !== Validators.required);

      if (isRequired) {
        currentValidators.push(Validators.required);
      } else if (allowNullOrEmptyForOptionalText && typeof control.value === 'string') {
        // For optional text fields, no specific validator needed beyond maxLength, etc.
        // which are assumed to be already part of the control's validators.
      }
      
      // Preserve other validators like maxLength, pattern, etc.
      // This logic might need refinement if multiple validators are set initially.
      // For now, we assume simple cases or that other validators are set with fb.control.
      // A more robust way would be to manage an array of validators.
      
      // Re-apply existing non-required validators
      const existingValidators = [];
      if (controlPath.includes('Description') || controlPath.includes('criticalServicesAffectedDescription') || controlPath.includes('nonCriticalServicesAffectedDescription')) {
          existingValidators.push(Validators.maxLength(this.MAX_TEXT_LENGTH));
      }
      if (controlPath.includes('serviceDowntime')) {
          existingValidators.push(ImpactAssessmentComponent.timeFormatValidator(), Validators.maxLength(8));
      }
       if (controlPath.startsWith('counterpartiesAffected.numberOf') || controlPath.startsWith('economicImpact.') && (controlPath.includes('Costs') || controlPath.includes('Amount'))) {
        existingValidators.push(Validators.min(0));
      }


      if (isRequired) {
        control.setValidators(Validators.compose([...existingValidators, Validators.required]));
      } else {
         control.setValidators(Validators.compose(existingValidators));
      }
      control.updateValueAndValidity();
    }
  }
}
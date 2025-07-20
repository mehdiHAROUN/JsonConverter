import { ValidationRule } from '../models/validation-rules.model';

/**
 * DORA-IR validation rules list based on the DORA-IR-Validation_Rules.csv file
 */
export const DORA_VALIDATION_RULES: ValidationRule[] = [
  {
    fieldId: '1.1',
    fieldName: 'Type of submission',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice',
    validationRule: 'Select one value from the VALUES tab for the corresponding field ID. Only one value is accepted.',
    errorCode: 'E-01',
    errorText: 'Type of report does not exist',
    errorType: 'blocking'
  },
  {
    fieldId: '1.2',
    fieldName: 'Name of the entity submitting the report',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'text',
    defaultValue: 'ENGIE GLOBAL MARKETS',
    errorCode: 'E-00',
    errorText: 'Mandatory field for all type of reports. Please ensure the field is completed',
    errorType: 'blocking'
  },
  {
    fieldId: '1.3a',
    fieldName: 'Identification code of the entity submitting the report (LEI)',
    required: false,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'text',
    format: 'ISO 17442-1:2020',
    validationRule: 'When populated, the code must be an ISO 17442 Legal Entity Identifier (LEI), 20 alphanumeric character code.',
    defaultValue: '5493003C3KJ2TY7MBZ44',
    errorCode: 'E-02',
    errorText: 'Invalid LEI Code',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '1.3b',
      condition: 'value === "" || value === null || value === undefined'
    }]
  },
  {
    fieldId: '1.3b',
    fieldName: 'Identification code of the entity submitting the report (EU ID)',
    required: false,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'text',
    validationRule: 'This field should not be populated with an ISO 17442 Legal Entity Identifier (LEI).',
    errorCode: 'E-15',
    errorText: 'Invalid ID. Please ensure that the ID is not an LEI. Valid LEI should be reported under field 1.3a',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '1.3a',
      condition: 'value === "" || value === null || value === undefined'
    }]
  },
  {
    fieldId: '1.4',
    fieldName: 'Type of the affected financial entity',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice-multiple',
    defaultValue: 'Investment firm',
    validationRule: 'Select one or more values from the VALUES tab for the corresponding field ID.',
    errorCode: 'E-03',
    errorText: 'Inexistent type of affected financial entity',
    errorType: 'blocking'
  },
  // Required fields for all report types
  {
    fieldId: '1.8',
    fieldName: 'Primary contact person email',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'email',
    validationRule: 'Must be a valid email format',
    errorCode: 'E-04',
    errorText: 'Invalid email format',
    errorType: 'blocking'
  },
  {
    fieldId: '1.9',
    fieldName: 'Primary contact person telephone',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'phone',
    format: 'International format (+33XXXXXXXXX)',
    errorCode: 'W-01',
    errorText: 'Invalid phone format',
    errorType: 'warning'
  },
  {
    fieldId: '1.15',
    fieldName: 'Reporting currency',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice',
    format: 'ISO 4217',
    defaultValue: 'EUR',
    errorCode: 'W-03',
    errorText: 'Invalid currency code',
    errorType: 'warning'
  },
  {
    fieldId: '2.1',
    fieldName: 'Incident reference code',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'text',
    validationRule: 'Unique identifier for the incident',
    errorCode: 'E-05',
    errorText: 'Incident reference code is required',
    errorType: 'blocking'
  },
  {
    fieldId: '2.2',
    fieldName: 'Date and time of detection',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'datetime',
    format: 'ISO 8601',
    errorCode: 'W-04',
    errorText: 'Invalid date and time format',
    errorType: 'warning'
  },
  {
    fieldId: '2.3',
    fieldName: 'Date and time of classification as major',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'datetime',
    format: 'ISO 8601',
    errorCode: 'W-05',
    errorText: 'Invalid date and time format',
    errorType: 'warning'
  },
  {
    fieldId: '2.4',
    fieldName: 'Description of the incident',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'E-06',
    errorText: 'Description is required',
    errorType: 'blocking'
  },
  {
    fieldId: '2.5',
    fieldName: 'Classification criteria',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice-multiple',
    validationRule: 'At least one criterion must be selected',
    errorCode: 'E-07',
    errorText: 'At least one classification criterion must be selected',
    errorType: 'blocking'
  },
  {
    fieldId: '2.7',
    fieldName: 'Discovery of the incident',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice',
    errorCode: 'W-06',
    errorText: 'Discovery method must be specified',
    errorType: 'warning'
  },
  {
    fieldId: '2.9',
    fieldName: 'Activation of business continuity plan',
    required: true,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'boolean',
    errorCode: 'W-07',
    errorText: 'Please specify if business continuity plan was activated',
    errorType: 'warning'
  },
  
  // Additional required fields for intermediate reports
  {
    fieldId: '3.2',
    fieldName: 'Date and time of occurrence',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'datetime',
    format: 'ISO 8601',
    errorCode: 'W-08',
    errorText: 'Invalid date and time format',
    errorType: 'warning'
  },
  {
    fieldId: '3.4',
    fieldName: 'Number of clients affected',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'number',
    errorCode: 'W-09',
    errorText: 'Must be a valid number',
    errorType: 'warning'
  },
  {
    fieldId: '3.5',
    fieldName: 'Percentage of clients affected',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'decimal',
    errorCode: 'W-10',
    errorText: 'Must be a valid percentage (e.g. 2.4)',
    errorType: 'warning'
  },
  {
    fieldId: '3.6',
    fieldName: 'Number of financial counterparts affected',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'number',
    errorCode: 'W-11',
    errorText: 'Must be a valid number',
    errorType: 'warning'
  },
  {
    fieldId: '3.7',
    fieldName: 'Percentage of financial counterparts affected',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'decimal',
    errorCode: 'W-12',
    errorText: 'Must be a valid percentage',
    errorType: 'warning'
  },
  {
    fieldId: '3.12',
    fieldName: 'Information whether numbers are actual/estimates',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    errorCode: 'W-13',
    errorText: 'Please specify if numbers are actual or estimates',
    errorType: 'warning'
  },
  {
    fieldId: '3.15',
    fieldName: 'Duration of the incident',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    format: 'DD:HH:MM',
    validationRule: 'Format must be DD:HH:MM',
    errorCode: 'W-14',
    errorText: 'Invalid format. Use DD:HH:MM',
    errorType: 'warning'
  },
  {
    fieldId: '3.22',
    fieldName: 'Critical services affected',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'E-08',
    errorText: 'Critical services affected is required',
    errorType: 'blocking'
  },
  {
    fieldId: '3.23',
    fieldName: 'Type of the incident',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    validationRule: 'At least one type must be selected',
    errorCode: 'E-09',
    errorText: 'At least one incident type must be selected',
    errorType: 'blocking'
  },
  {
    fieldId: '3.27',
    fieldName: 'Affected functional areas and business processes',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'W-15',
    errorText: 'Please specify affected functional areas',
    errorType: 'warning'
  },
  {
    fieldId: '3.28',
    fieldName: 'Affected infrastructure components',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice',
    errorCode: 'W-16',
    errorText: 'Please specify affected infrastructure components',
    errorType: 'warning'
  },
  {
    fieldId: '3.30',
    fieldName: 'Impact on the financial interest of clients',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice',
    errorCode: 'W-17',
    errorText: 'Please specify impact on financial interest of clients',
    errorType: 'warning'
  },
  {
    fieldId: '3.31',
    fieldName: 'Reporting to other authorities',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    errorCode: 'W-18',
    errorText: 'Please specify if incident reported to other authorities',
    errorType: 'warning'
  },
  {
    fieldId: '3.33',
    fieldName: 'Temporary actions/measures taken',
    required: true,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'boolean',
    errorCode: 'W-19',
    errorText: 'Please specify if temporary measures were taken',
    errorType: 'warning'
  },
  
  // Additional required fields for final reports
  {
    fieldId: '4.1',
    fieldName: 'High-level classification of root causes',
    required: true,
    requiredFor: ['final'],
    fieldType: 'choice-multiple',
    validationRule: 'At least one root cause must be selected',
    errorCode: 'E-10',
    errorText: 'At least one root cause must be selected',
    errorType: 'blocking'
  },
  {
    fieldId: '4.2',
    fieldName: 'Detailed classification of root causes',
    required: true,
    requiredFor: ['final'],
    fieldType: 'choice-multiple',
    errorCode: 'W-20',
    errorText: 'Please provide detailed classification of root causes',
    errorType: 'warning'
  },
  {
    fieldId: '4.5',
    fieldName: 'Information about root causes',
    required: true,
    requiredFor: ['final'],
    fieldType: 'text',
    errorCode: 'W-21',
    errorText: 'Please provide information about root causes',
    errorType: 'warning'
  },
  {
    fieldId: '4.6',
    fieldName: 'Incident resolution',
    required: true,
    requiredFor: ['final'],
    fieldType: 'text',
    errorCode: 'E-11',
    errorText: 'Incident resolution information is required',
    errorType: 'blocking'
  },
  {
    fieldId: '4.8',
    fieldName: 'Date and time when incident was resolved',
    required: true,
    requiredFor: ['final'],
    fieldType: 'datetime',
    format: 'ISO 8601',
    errorCode: 'E-12',
    errorText: 'Resolution date and time is required',
    errorType: 'blocking'
  },
  {
    fieldId: '4.12',
    fieldName: 'Materiality threshold - Economic impact',
    required: true,
    requiredFor: ['final'],
    fieldType: 'text',
    errorCode: 'W-22',
    errorText: 'Please provide information about economic impact',
    errorType: 'warning'
  },
  {
    fieldId: '4.13',
    fieldName: 'Amount of gross costs and losses',
    required: true,
    requiredFor: ['final'],
    fieldType: 'decimal',
    errorCode: 'W-23',
    errorText: 'Please provide amount of gross costs (in thousands)',
    errorType: 'warning'
  },
  {
    fieldId: '4.14',
    fieldName: 'Amount of financial recoveries',
    required: true,
    requiredFor: ['final'],
    fieldType: 'decimal',
    errorCode: 'W-24',
    errorText: 'Please provide amount of financial recoveries (in thousands)',
    errorType: 'warning'
  },
  
  // Champs conditionnels
  {
    fieldId: '2.6',
    fieldName: 'Countries affected',
    required: false,
    requiredFor: ['initial', 'intermediate', 'final'],
    fieldType: 'choice-multiple',
    format: 'ISO 3166',
    errorCode: 'E-24',
    errorText: 'Mandatory if Geographical spread criterion is met',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '2.5',
      condition: 'Array.isArray(value) && value.includes("Geographical spread")'
    }]
  },
  {
    fieldId: '3.18',
    fieldName: 'List of jurisdictions',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    errorCode: 'E-25',
    errorText: 'Mandatory if Geographical spread criterion is met',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '2.5',
      condition: 'Array.isArray(value) && value.includes("Geographical spread")'
    }]
  },
  {
    fieldId: '3.19',
    fieldName: 'Countries where the incident has impact',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    format: 'ISO 3166',
    errorCode: 'E-26',
    errorText: 'Mandatory if Geographical spread criterion is met',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '2.5',
      condition: 'Array.isArray(value) && value.includes("Geographical spread")'
    }]
  },
  {
    fieldId: '3.20',
    fieldName: 'Types of data affected',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    errorCode: 'E-27',
    errorText: 'Mandatory if Data losses criterion is met',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '2.5',
      condition: 'Array.isArray(value) && value.includes("Data losses")'
    }]
  },
  {
    fieldId: '3.21',
    fieldName: 'Quantity of data affected',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'E-28',
    errorText: 'Mandatory if Data losses criterion is met',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '2.5',
      condition: 'Array.isArray(value) && value.includes("Data losses")'
    }]
  },
  {
    fieldId: '3.3',
    fieldName: 'Service downtime',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    format: 'DD:HH:MM',
    errorCode: 'E-29',
    errorText: 'Mandatory if service downtime > 0',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '3.16',
      condition: 'value > 0'
    }]
  },
  {
    fieldId: '3.25',
    fieldName: 'Cybersecurity incident patterns',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'choice-multiple',
    errorCode: 'E-30',
    errorText: 'Mandatory if incident is cybersecurity-related',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '3.23',
      condition: 'Array.isArray(value) && value.includes("Cybersecurity-related")'
    }]
  },
  {
    fieldId: '3.29',
    fieldName: 'Critical or important function',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'E-31',
    errorText: 'Mandatory if affected infrastructure components = Yes',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '3.28',
      condition: 'value === "Yes"'
    }]
  },
  {
    fieldId: '3.34',
    fieldName: 'Temporary actions/measures description',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'text',
    errorCode: 'E-32',
    errorText: 'Mandatory if temporary actions/measures taken = Yes',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '3.33',
      condition: 'value === "Yes"'
    }]
  },
  {
    fieldId: '3.35',
    fieldName: 'Notification to CSIRTs',
    required: false,
    requiredFor: ['intermediate', 'final'],
    fieldType: 'boolean',
    errorCode: 'E-33',
    errorText: 'Mandatory for specific financial entities if incident is cybersecurity-related',
    errorType: 'blocking',
    dependsOn: [{
      fieldId: '3.23',
      condition: 'Array.isArray(value) && value.includes("Cybersecurity-related")'
    }]
  }
];

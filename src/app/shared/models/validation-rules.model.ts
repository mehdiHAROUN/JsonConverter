export type ReportType = 'initial' | 'intermediate' | 'final';
export type ErrorType = 'blocking' | 'warning';
export type FieldType = 'text' | 'choice' | 'choice-multiple' | 'datetime' | 'boolean' | 'number' | 'decimal' | 'email' | 'phone';

export interface ValidationRule {
  fieldId: string;
  fieldName: string;
  required: boolean;
  requiredFor: ReportType[];
  fieldType: FieldType;
  format?: string;
  validationRule?: string;
  errorCode?: string;
  errorText?: string;
  errorType: ErrorType;
  defaultValue?: string;
  dependsOn?: {
    fieldId: string;
    condition: string;
  }[];
}

// Structure pour les options des champs de type "choice" ou "choice-multiple"
export interface FieldOption {
  value: string;
  label: string;
}

// Interface pour stocker les valeurs des champs de collection (comme les pays)
export interface FieldValues {
  fieldId: string;
  values: FieldOption[];
}

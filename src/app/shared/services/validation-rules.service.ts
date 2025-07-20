import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ValidationRule, ReportType } from '../models/validation-rules.model';
import { DORA_VALIDATION_RULES } from './validation-rules.data';

@Injectable({
  providedIn: 'root'
})
export class ValidationRulesService {
  constructor() { }

  /**
   * Get all validation rules
   */
  getAllRules(): ValidationRule[] {
    return DORA_VALIDATION_RULES;
  }

  /**
   * Get all rules required for a specific report type
   */
  getRulesForReportType(reportType: ReportType): ValidationRule[] {
    return DORA_VALIDATION_RULES.filter(rule => 
      rule.requiredFor.includes(reportType));
  }
  
  /**
   * Get validation rule by field ID
   */
  getRuleByFieldId(fieldId: string): ValidationRule | undefined {
    return DORA_VALIDATION_RULES.find(rule => rule.fieldId === fieldId);
  }

  /**
   * Get validators for a specific field
   */
  getValidatorsForField(fieldId: string, reportType: ReportType): ValidatorFn[] {
    const rule = this.getRuleByFieldId(fieldId);
    if (!rule) return [];

    const validators: ValidatorFn[] = [];
    
    // Add required validator if the field is required for this report type
    if (rule.required && rule.requiredFor.includes(reportType)) {
      validators.push(Validators.required);
    }
    
    // Add format-specific validators
    switch (rule.fieldType) {
      case 'email':
        validators.push(Validators.email);
        break;
      case 'phone':
        validators.push(this.phoneValidator());
        break;
      case 'datetime':
        validators.push(this.dateTimeValidator());
        break;
      case 'decimal':
        validators.push(this.decimalValidator());
        break;
      case 'choice-multiple':
        // For multiple choice with minimum selection (if specified in the validation rule)
        if (rule.validationRule?.includes('At least one')) {
          validators.push(this.minItemsValidator(1));
        }
        break;
    }
    
    return validators;
  }
  
  /**
   * Create conditional validator for fields that depend on other fields
   */
  createConditionalValidator(rule: ValidationRule, formGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!rule.dependsOn || rule.dependsOn.length === 0) return null;
      
      // Check each dependency
      for (const dependency of rule.dependsOn) {
        const dependentField = formGroup.get(dependency.fieldId);
        if (!dependentField) continue;
        
        // Evaluate condition
        if (this.evaluateCondition(dependency.condition, dependentField.value)) {
          // If dependent condition is true, apply required validator
          if (control.value === null || control.value === undefined || control.value === '') {
            return { conditionallyRequired: true };
          }
        }
      }
      
      return null;
    };
  }
  
  /**
   * Evaluate a dependency condition
   */
  private evaluateCondition(condition: string, value: any): boolean {
    try {
      // Handle common condition patterns
      if (condition.includes('includes')) {
        const searchValue = condition.substring(
          condition.indexOf('"') + 1, 
          condition.lastIndexOf('"')
        );
        return Array.isArray(value) && value.includes(searchValue);
      }
      
      if (condition.includes('===')) {
        const parts = condition.split('===');
        if (parts.length < 2 || parts[1] === undefined) return false;
        const compareValue = parts[1].trim().replace(/['"]/g, '');
        return value === compareValue;
      }
      
      if (condition.includes('>')) {
        const parts = condition.split('>');
        if (parts.length < 2 || parts[1] === undefined) return false;
        const compareValue = parseFloat(parts[1].trim());
        if (isNaN(compareValue)) return false;
        return parseFloat(value) > compareValue;
      }
      // For more complex conditions, evaluate as JavaScript
      // (Be careful with this in production!)
      return new Function('value', `return ${condition.replace('value', JSON.stringify(value))};`)();
    } catch (e) {
      console.error('Error evaluating condition:', e);
      return false;
    }
  }
  
  /**
   * Validators for specific field types
   */
  phoneValidator(): ValidatorFn {
    const phoneRegex = /^\+[0-9]{1,3}[0-9]{4,14}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return phoneRegex.test(value) ? null : { invalidPhone: true };
    };
  }
  
  dateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Check if it's a valid date
      const date = new Date(value);
      return isNaN(date.getTime()) ? { invalidDateTime: true } : null;
    };
  }
  
  decimalValidator(): ValidatorFn {
    const decimalRegex = /^-?\d*\.?\d+$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return decimalRegex.test(value) ? null : { invalidDecimal: true };
    };
  }
  
  minItemsValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return { minItems: { required: min, actual: 0 } };
      }
      return control.value.length >= min ? null : { minItems: { required: min, actual: control.value.length } };
    };
  }
}

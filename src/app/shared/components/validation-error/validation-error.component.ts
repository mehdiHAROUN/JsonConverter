import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormControl } from '@angular/forms';
import { ValidationRulesService } from '../../services/validation-rules.service';
import { ValidationRule } from '../../models/validation-rules.model';

@Component({
  selector: 'app-validation-error',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatIconModule],
  template: `
    <div *ngIf="showError" class="validation-error">
      <mat-icon class="error-icon" [ngClass]="{'blocking': isBlocking, 'warning': !isBlocking}" 
                [matTooltip]="getFullErrorMessage()">
        {{ isBlocking ? 'error' : 'warning' }}
      </mat-icon>
      <span [ngClass]="{'blocking-text': isBlocking, 'warning-text': !isBlocking}">
        {{ getErrorMessage() }}
      </span>
    </div>
  `,
  styles: [`
    .validation-error {
      display: flex;
      align-items: center;
      margin-top: 4px;
    }
    .error-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }
    .blocking {
      color: #d32f2f;
    }
    .warning {
      color: #ed6c02;
    }
    .blocking-text {
      color: #d32f2f;
      font-size: 12px;
    }
    .warning-text {
      color: #ed6c02;
      font-size: 12px;
    }
  `]
})
export class ValidationErrorComponent {
  @Input() control: FormControl | null = null;
  @Input() fieldId!: string;
  
  constructor(private validationService: ValidationRulesService) {}
  
  get showError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }
  
  get isBlocking(): boolean {
    const rule = this.validationService.getRuleByFieldId(this.fieldId);
    return rule?.errorType === 'blocking';
  }
  
  getErrorMessage(): string {
    const rule = this.validationService.getRuleByFieldId(this.fieldId);
    
    if (!rule || !this.control?.errors) {
      return '';
    }
    
    // Check for specific error types
    if (this.control.errors['required']) {
      return 'This field is required.';
    }
    
    if (this.control.errors['email']) {
      return 'Invalid email format.';
    }
    
    if (this.control.errors['invalidPhone']) {
      return 'Invalid phone number format.';
    }
    
    if (this.control.errors['invalidDateTime']) {
      return 'Invalid date and time.';
    }
    
    if (this.control.errors['invalidDecimal']) {
      return 'Invalid number format.';
    }
    
    if (this.control.errors['minItems']) {
      return `At least ${this.control.errors['minItems'].required} item(s) must be selected.`;
    }
    
    if (this.control.errors['conditionallyRequired']) {
      return 'This field is required based on other selections.';
    }
    
    // Default to error text from validation rule if available
    return rule?.errorText || 'Invalid value.';
  }
  
  getFullErrorMessage(): string {
    const rule = this.validationService.getRuleByFieldId(this.fieldId);
    
    if (!rule) {
      return this.getErrorMessage();
    }
    
    let message = this.getErrorMessage();
    
    // Add validation rule if available
    if (rule.validationRule) {
      message += `\nValidation: ${rule.validationRule}`;
    }
    
    // Add format if available
    if (rule.format) {
      message += `\nFormat: ${rule.format}`;
    }
    
    return message;
  }
}

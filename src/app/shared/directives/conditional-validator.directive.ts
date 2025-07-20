import { Directive, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ValidationRulesService } from '../services/validation-rules.service';
import { ValidationRule } from '../models/validation-rules.model';

@Directive({
  selector: '[appConditionalValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ConditionalValidatorDirective,
      multi: true
    }
  ],
  standalone: true
})
export class ConditionalValidatorDirective implements Validator, OnInit, OnDestroy {
  @Input() appConditionalValidator!: string; // Field ID
  @Input() reportType!: 'initial' | 'intermediate' | 'final';

  private formGroup!: FormGroup;
  private validationRule?: ValidationRule;
  private subscriptions: Subscription[] = [];
  
  constructor(@Inject(ValidationRulesService) private validationService: ValidationRulesService) {}
  
  ngOnInit(): void {
    // Get the validation rule for the field
    this.validationRule = this.validationService.getRuleByFieldId(this.appConditionalValidator);
    
    // If the field has dependencies, set up listeners
    if (this.validationRule?.dependsOn && this.validationRule.dependsOn.length > 0) {
      this.setupDependencyListeners();
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  validate(control: AbstractControl): ValidationErrors | null {
    // Store a reference to the form group
    if (control.parent && !this.formGroup) {
      this.formGroup = control.parent as FormGroup;
      
      // Set up listeners if not done yet
      if (this.validationRule?.dependsOn && this.validationRule.dependsOn.length > 0 && this.subscriptions.length === 0) {
        this.setupDependencyListeners();
      }
    }
    
    // If there's no validation rule or form group, return null
    if (!this.validationRule || !this.formGroup) {
      return null;
    }
    
    // Apply conditional validation using the validation service
    const conditionalValidator = this.validationService.createConditionalValidator(this.validationRule, this.formGroup);
    return conditionalValidator(control);
  }
  
  private setupDependencyListeners(): void {
    if (!this.validationRule?.dependsOn || !this.formGroup) return;
    
    // Set up listeners for each dependency
    this.validationRule.dependsOn.forEach((dependency: { fieldId: string; condition: string }) => {
      const dependentControl = this.formGroup.get(dependency.fieldId);
      if (dependentControl) {
        const subscription = dependentControl.valueChanges.subscribe(() => {
          // Trigger validation on the current control
          const control = this.formGroup.get(this.appConditionalValidator);
          if (control) {
            control.updateValueAndValidity();
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }
}

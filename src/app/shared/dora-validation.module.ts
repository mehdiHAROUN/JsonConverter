import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationErrorComponent } from './components/validation-error/validation-error.component';
import { ConditionalValidatorDirective } from './directives/conditional-validator.directive';
import { ValidationRulesService } from './services/validation-rules.service';
import { DoraValidationExampleComponent } from './examples/dora-validation-example.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Module containing components and services related to DORA-IR validations
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    ValidationErrorComponent,
    DoraValidationExampleComponent
  ],
  providers: [
    ValidationRulesService
  ]
})
export class DoraValidationModule { }
export class DoraValidationModule { }

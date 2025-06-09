import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    MatTabsModule
  ],
  templateUrl: './incident-report-form.component.html',
  styleUrl: './incident-report-form.component.scss'
})
export class IncidentReportFormComponent implements OnInit, OnDestroy {
  incidentForm: FormGroup;
  private destroy$ = new Subject<void>();
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.incidentForm = this.fb.group({
      // Incident Submission Details
      submissionDate: [new Date(), Validators.required],
      reporterName: ['', [Validators.required, Validators.minLength(3)]],
      reporterRole: ['', Validators.required],

      // Entity Information
      entityName: ['', Validators.required],
      entityType: ['', Validators.required],
      entityLocation: ['', Validators.required],

      // Contact Information
      contactName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern('^[0-9-+()]*$')]],

      // Incident Details
      incidentTitle: ['', [Validators.required, Validators.minLength(3)]],
      incidentDate: ['', [Validators.required, this.dateValidator()]],
      incidentDescription: ['', [Validators.required, Validators.minLength(10)]],
      severity: ['', Validators.required],

      // Impact Assessment
      financialImpact: [0, [Validators.required, Validators.min(0)]],
      operationalImpact: ['', Validators.required],
      customerImpact: ['', Validators.required],

      // Reporting to Other Authorities
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
}

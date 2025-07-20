import { Injectable, type OnDestroy, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export interface FormSession {
  formId: string;
  data: Record<string, unknown>;
  timestamp: number;
  route?: string;
  expiresAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormPersistenceService implements OnDestroy {
  private readonly STORAGE_PREFIX = 'dora_form_';
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private destroy$ = new Subject<void>();
  private activeForms = new Set<string>();

  private router = inject(Router);

  constructor() {
    this.cleanExpiredData();

    // Listen to route changes to automatically save
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveAllActiveForms();
      });
  }

  /**
   * Registers a form for automatic persistence
   */
  registerForm(
    formId: string,
    form: FormGroup,
    options: {
      autoSave?: boolean;
      saveOnNavigation?: boolean;
      excludeFields?: string[];
      includeFields?: string[];
      expiryHours?: number;
    } = {}
  ) {
    const {
      autoSave = true,
      saveOnNavigation = true,
      excludeFields = [],
      includeFields,
      expiryHours = 700
    } = options;

    // Mark the form as active
    this.activeForms.add(formId);

    // Load saved data
    const savedData = this.loadFormData(formId);
    if (savedData) {
      this.restoreFormValues(form, savedData, excludeFields, includeFields);
    }

    // Auto-save configuration
    if (autoSave) {
      let saveTimeout: any;

      form.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(values => {
          // Debounce to avoid too many saves
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }

          saveTimeout = setTimeout(() => {
            this.saveFormData(formId, values, {
              excludeFields,
              includeFields,
              expiryHours
            });
          }, 1000); // Save after 1 second of inactivity
        });
    }

    return {
      save: () => this.saveFormData(formId, form.value, { excludeFields, includeFields, expiryHours }),
      load: () => this.loadFormData(formId),
      clear: () => this.clearFormData(formId),
      restore: () => {
        const data = this.loadFormData(formId);
        if (data) {
          this.restoreFormValues(form, data, excludeFields, includeFields);
        }
        return !!data;
      }
    };
  }

  /**
   * Unregisters a form
   */
  unregisterForm(formId: string) {
    this.activeForms.delete(formId);
  }

  /**
   * Saves the data of a form
   */
  saveFormData(
    formId: string,
    data: any,
    options: {
      excludeFields?: string[];
      includeFields?: string[];
      expiryHours?: number;
    } = {}
  ) {
    const { excludeFields = [], includeFields, expiryHours = 24 } = options;
    
    try {
      const filteredData = this.filterFormData(data, excludeFields, includeFields);
      
      const session: FormSession = {
        formId,
        data: filteredData,
        timestamp: Date.now(),
        route: this.router.url,
        expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000)
      };

      localStorage.setItem(
        this.getStorageKey(formId),
        JSON.stringify(session)
      );
      
      console.debug(`Form data saved for: ${formId}`);
    } catch (error) {
      console.error(`Failed to save form data for ${formId}:`, error);
    }
  }

  /**
   * Loads the data of a form
   */
  loadFormData(formId: string): any {
    try {
      const key = this.getStorageKey(formId);
      const saved = localStorage.getItem(key);
      
      if (!saved) return null;

      const session: FormSession = JSON.parse(saved);
      
      // Check expiration
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearFormData(formId);
        return null;
      }

      console.debug(`Form data loaded for: ${formId}`);
      return session.data;
    } catch (error) {
      console.error(`Failed to load form data for ${formId}:`, error);
      return null;
    }
  }

  /**
   * Clears the data of a form
   */
  clearFormData(formId: string) {
    localStorage.removeItem(this.getStorageKey(formId));
    console.debug(`Form data cleared for: ${formId}`);
  }

  /**
   * Clears all form data
   */
  clearAllFormData() {
    const keys = Object.keys(localStorage);
    const doraKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
    
    console.debug(`Found ${doraKeys.length} DORA form keys to clear:`, doraKeys);
    
    doraKeys.forEach(key => {
      localStorage.removeItem(key);
      console.debug(`Removed key: ${key}`);
    });
    
    console.debug('All form data cleared');
  }

  /**
   * Gets the list of saved forms
   */
  getSavedForms(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.STORAGE_PREFIX))
      .map(key => key.replace(this.STORAGE_PREFIX, ''));
  }

  /**
   * Checks if a form has saved data
   */
  hasFormData(formId: string): boolean {
    return localStorage.getItem(this.getStorageKey(formId)) !== null;
  }

  private saveAllActiveForms() {
    // This method could be extended to automatically save
    // all active forms during navigation
    console.debug('Navigation detected, active forms:', Array.from(this.activeForms));
  }

  private restoreFormValues(
    form: FormGroup,
    data: any,
    excludeFields: string[] = [],
    includeFields?: string[]
  ) {
    const filteredData = this.filterFormData(data, excludeFields, includeFields);
    
    // Convert ISO date strings back to Date objects for form controls
    const processedData = this.convertIsoStringsToDate(filteredData, form);
    
    form.patchValue(processedData, { emitEvent: false });
  }

  private convertIsoStringsToDate(data: any, form: FormGroup): any {
    if (!data || typeof data !== 'object') return data;

    const processed: any = {};

    Object.keys(data).forEach(key => {
      const control = form.get(key);
      
      // If it's a string that looks like an ISO date and the control exists
      if (typeof data[key] === 'string' && this.isIsoDateString(data[key]) && control) {
        processed[key] = new Date(data[key]);
      }
      // Recursive handling for nested objects
      else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key]) && control instanceof FormGroup) {
        processed[key] = this.convertIsoStringsToDate(data[key], control);
      } else {
        processed[key] = data[key];
      }
    });

    return processed;
  }

  private isIsoDateString(value: string): boolean {
    // Check if string matches ISO 8601 format and is a valid date
    // More flexible regex to handle different ISO formats
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(value) && !isNaN(Date.parse(value));
  }

  private filterFormData(
    data: any,
    excludeFields: string[] = [],
    includeFields?: string[]
  ): any {
    if (!data || typeof data !== 'object') return data;

    const filtered: any = {};

    Object.keys(data).forEach(key => {
      // If includeFields is set, include only these fields
      if (includeFields && !includeFields.includes(key)) {
        return;
      }

      // Exclude the specified fields
      if (excludeFields.includes(key)) {
        return;
      }

      // Handle Date objects - convert to ISO string for storage
      if (data[key] instanceof Date) {
        filtered[key] = data[key].toISOString();
      }
      // Recursive handling for nested objects (but not Date objects or Arrays)
      else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key]) && !(data[key] instanceof Date)) {
        filtered[key] = this.filterFormData(data[key], excludeFields, includeFields);
      } else {
        filtered[key] = data[key];
      }
    });

    return filtered;
  }

  private getStorageKey(formId: string): string {
    return `${this.STORAGE_PREFIX}${formId}`;
  }

  private cleanExpiredData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const session: FormSession = JSON.parse(localStorage.getItem(key) || '{}');
          if (session.expiresAt && Date.now() > session.expiresAt) {
            localStorage.removeItem(key);
            console.debug(`Expired form data removed: ${key}`);
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

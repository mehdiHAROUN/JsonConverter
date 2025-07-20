import { FormGroup } from '@angular/forms';
import { effect, signal } from '@angular/core';

export interface FormPersistenceConfig {
  key: string;
  excludeFields?: string[];
  includeFields?: string[];
  autoSave?: boolean;
  saveDelay?: number;
}

export class FormPersistenceService {
  private saveTimeouts = new Map<string, any>();

  /**
   * Creates a signal that automatically persists form values
   */
  createPersistedFormSignal<T extends Record<string, any>>(
    form: FormGroup,
    config: FormPersistenceConfig
  ) {
    const { key, excludeFields = [], includeFields, autoSave = true, saveDelay = 500 } = config;
    
    // Load saved data
    const savedData = this.loadFormData(key);
    
    // Create the signal with saved data or default values
    const formSignal = signal<T>(savedData || form.value);

    // Restaurer les valeurs dans le formulaire
    if (savedData) {
      this.restoreFormValues(form, savedData, excludeFields, includeFields);
    }

    // Listen to form changes for auto-save
    if (autoSave) {
      form.valueChanges.subscribe((values) => {
        this.debouncedSave(key, values, excludeFields, includeFields, saveDelay);
      });
    }

    // Effect pour synchroniser le signal avec localStorage
    effect(() => {
      const currentValue = formSignal();
      if (currentValue) {
        this.saveFormData(key, currentValue, excludeFields, includeFields);
      }
    });

    return {
      signal: formSignal,
      save: () => this.saveFormData(key, form.value, excludeFields, includeFields),
      load: () => this.loadFormData(key),
      clear: () => this.clearFormData(key),
      restore: () => {
        const data = this.loadFormData(key);
        if (data) {
          this.restoreFormValues(form, data, excludeFields, includeFields);
        }
        return data;
      }
    };
  }

  private debouncedSave(
    key: string,
    values: any,
    excludeFields: string[],
    includeFields?: string[],
    delay: number = 500
  ) {
    // Cancel previous timer
    if (this.saveTimeouts.has(key)) {
      clearTimeout(this.saveTimeouts.get(key));
    }

    // Create a new timer
    const timeoutId = setTimeout(() => {
      this.saveFormData(key, values, excludeFields, includeFields);
      this.saveTimeouts.delete(key);
    }, delay);

    this.saveTimeouts.set(key, timeoutId);
  }

  private saveFormData(
    key: string,
    values: any,
    excludeFields: string[] = [],
    includeFields?: string[]
  ) {
    try {
      const dataToSave = this.filterFormData(values, excludeFields, includeFields);
      
      // Ajouter timestamp pour la gestion de l'expiration
      const dataWithMeta = {
        data: dataToSave,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(key, JSON.stringify(dataWithMeta));
    } catch (error) {
      console.warn(`Failed to save form data for key: ${key}`, error);
    }
  }

  private loadFormData(key: string): any {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      
      // Check if data is not too old (optional)
      // const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      // if (Date.now() - parsed.timestamp > maxAge) {
      //   this.clearFormData(key);
      //   return null;
      // }

      return parsed.data || parsed; // Support ancien format
    } catch (error) {
      console.warn(`Failed to load form data for key: ${key}`, error);
      return null;
    }
  }

  private clearFormData(key: string) {
    localStorage.removeItem(key);
  }

  private restoreFormValues(
    form: FormGroup,
    data: any,
    excludeFields: string[] = [],
    includeFields?: string[]
  ) {
    const filteredData = this.filterFormData(data, excludeFields, includeFields);
    
    // Patch the form with filtered data
    form.patchValue(filteredData, { emitEvent: false });
  }

  private filterFormData(
    data: any,
    excludeFields: string[] = [],
    includeFields?: string[]
  ): any {
    if (!data || typeof data !== 'object') return data;

    const filtered: any = {};

    Object.keys(data).forEach(key => {
      // Si includeFields est défini, n'inclure que ces champs
      if (includeFields && !includeFields.includes(key)) {
        return;
      }

      // Exclure les champs spécifiés
      if (excludeFields.includes(key)) {
        return;
      }

      // Gestion récursive pour les objets imbriqués
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        filtered[key] = this.filterFormData(data[key], excludeFields, includeFields);
      } else {
        filtered[key] = data[key];
      }
    });

    return filtered;
  }

  /**
   * Cleans all stored form data (useful for logout)
   */
  clearAllFormData(prefix?: string) {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (!prefix || key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Instance globale du service
export const formPersistenceService = new FormPersistenceService();

/**
 * Hook pour persister facilement un formulaire
 */
export function usePersistedForm<T extends Record<string, any>>(
  form: FormGroup,
  key: string,
  options?: Partial<FormPersistenceConfig>
) {
  return formPersistenceService.createPersistedFormSignal<T>(form, {
    key,
    ...options
  });
}

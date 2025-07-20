import { Directive, Input, type OnInit, type OnDestroy, Host, Optional, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { FormPersistenceService } from '../../core/services/form-persistence.service';

@Directive({
  selector: '[appFormPersistence]',
  standalone: true
})
export class FormPersistenceDirective implements OnInit, OnDestroy {
  @Input('appFormPersistence') formId!: string;
  @Input() excludeFields: string[] = [];
  @Input() includeFields?: string[];
  @Input() autoSave: boolean = true;
  @Input() expiryHours: number = 24;

  private persistenceHandle: {
    save: () => void;
    load: () => unknown;
    clear: () => void;
    restore: () => boolean;
  } | null = null;
  private formPersistenceService = inject(FormPersistenceService);

  constructor(
    @Host() @Optional() private formGroupDirective: FormGroupDirective
  ) {}

  ngOnInit() {
    if (!this.formGroupDirective) {
      console.error('FormPersistenceDirective must be used with a FormGroup');
      return;
    }

    if (!this.formId) {
      console.error('FormPersistenceDirective requires a formId');
      return;
    }

    const form = this.formGroupDirective.form;
    
    this.persistenceHandle = this.formPersistenceService.registerForm(
      this.formId,
      form,
      {
        autoSave: this.autoSave,
        excludeFields: this.excludeFields,
        includeFields: this.includeFields,
        expiryHours: this.expiryHours
      }
    );
  }

  ngOnDestroy() {
    if (this.formId) {
      this.formPersistenceService.unregisterForm(this.formId);
    }
  }

  // Public methods to control persistence
  save() {
    return this.persistenceHandle?.save();
  }

  load() {
    return this.persistenceHandle?.load();
  }

  clear() {
    return this.persistenceHandle?.clear();
  }

  restore() {
    return this.persistenceHandle?.restore();
  }
}

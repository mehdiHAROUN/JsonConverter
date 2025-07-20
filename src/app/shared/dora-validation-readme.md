# Système de validation DORA-IR pour Angular

Ce module fournit un système de validation conforme aux règles DORA-IR pour les formulaires Angular. Il permet de gérer les validations obligatoires et conditionnelles selon les différents types de rapports (initial, intermédiaire et final).

## Installation

1. Importez le module `DoraValidationModule` dans votre application:

```typescript
import { DoraValidationModule } from './shared/dora-validation.module';

@NgModule({
  imports: [
    // ...
    DoraValidationModule
  ]
})
export class AppModule { }
```

## Utilisation

### 1. Injection du service de validation

Injectez le `ValidationRulesService` dans vos composants:

```typescript
constructor(
  private fb: FormBuilder,
  private validationService: ValidationRulesService
) { }
```

### 2. Définition du type de rapport

Dans votre composant, définissez le type de rapport:

```typescript
@Input() reportType: ReportType = 'initial'; // 'initial', 'intermediate', ou 'final'
```

### 3. Création du formulaire avec les validateurs

```typescript
createForm(): FormGroup {
  return this.fb.group({
    // Champ 2.1: Incident reference code
    financialEntityCode: ['', this.validationService.getValidatorsForField('2.1', this.reportType)],
    
    // Champ 2.2: Date and time of detection
    detectionDate: [null, this.validationService.getValidatorsForField('2.2', this.reportType)],
    detectionTime: ['', this.validationService.getValidatorsForField('2.2', this.reportType)],
    
    // etc.
  });
}
```

### 4. Ajout des validateurs conditionnels dans le template

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Incident reference code(field 2.1)</mat-label>
  <input matInput formControlName="financialEntityCode"
         appConditionalValidator="2.1" [reportType]="reportType">
  <app-validation-error [control]="myForm.get('financialEntityCode')!" 
                       fieldId="2.1"></app-validation-error>
</mat-form-field>
```

### 5. Gestion des champs conditionnels

Pour les champs qui dépendent d'autres champs, le système utilise la directive `appConditionalValidator`:

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Countries affected (field 2.6)</mat-label>
  <mat-select formControlName="countriesAffected" multiple
            appConditionalValidator="2.6" [reportType]="reportType">
    <mat-option value="FR">France</mat-option>
    <mat-option value="DE">Germany</mat-option>
    <!-- etc. -->
  </mat-select>
  <app-validation-error [control]="myForm.get('countriesAffected')!" 
                       fieldId="2.6"></app-validation-error>
</mat-form-field>
```

## Exemples

Voir le composant d'exemple `DoraValidationExampleComponent` pour un exemple complet d'implémentation.

## Règles de validation

Les règles de validation sont définies dans le fichier `validation-rules.data.ts`. Elles incluent:
- Champs obligatoires par type de rapport
- Validations de format (email, téléphone, date, etc.)
- Validations conditionnelles basées sur d'autres champs
- Gestion des types d'erreur (blocking/warning)

## Personnalisation

Vous pouvez personnaliser les messages d'erreur et les validations en modifiant:
- Le composant `ValidationErrorComponent`
- Le service `ValidationRulesService`
- Les données des règles dans `validation-rules.data.ts`

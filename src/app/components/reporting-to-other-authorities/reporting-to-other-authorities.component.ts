import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reporting-to-other-authorities',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './reporting-to-other-authorities.component.html',
  styleUrl: './reporting-to-other-authorities.component.scss'
})
export class ReportingToOtherAuthoritiesComponent implements OnInit {
  reportingForm: FormGroup;

  // Options for High-level classification of root causes of the incident (field 4.1)
  highLevelClassificationRootCausesOptions = [
    { value: 'malicious_actions', label: 'Malicious actions' },
    { value: 'process_failure', label: 'Process failure' },
    { value: 'system_failure_malfunction', label: 'System failure / malfunction' },
    { value: 'human_error', label: 'Human error' },
    { value: 'external_event', label: 'External event' }
  ];

  // Options for Detailed classification of root causes of the incident (field 4.2)
  detailedClassificationRootCausesOptions = [
    { value: 'malicious_actions_deliberate_internal', label: 'malicious actions: deliberate internal actions' },
    { value: 'malicious_actions_deliberate_physical', label: 'malicious actions: deliberate physical damage/manipulation/theft' },
    { value: 'malicious_actions_fraudulent', label: 'malicious actions: fraudulent actions' },
    { value: 'process_failure_insufficient_monitoring', label: 'process failure: insufficient monitoring or failure of monitoring and control' },
    { value: 'process_failure_insufficient_roles', label: 'process failure: insufficient/unclear roles and responsibilities' },
    { value: 'process_failure_ict_risk_management', label: 'process failure: ICT risk management process failure' },
    { value: 'process_failure_ict_operations', label: 'process failure: insufficient or failure of ICT operations and ICT security operations' },
    { value: 'process_failure_ict_project_management', label: 'process failure: insufficient or failure of ICT project management' },
    { value: 'process_failure_inadequate_policies', label: 'process failure: inadequacy of internal policies, procedures and documentation' },
    { value: 'process_failure_inadequate_ict_systems', label: 'Process failure: inadequate ICT systems acquisition, development, and maintenance' },
    { value: 'process_failure_other', label: 'process failure: other (please specify)' },
    { value: 'system_failure_hardware_capacity', label: 'system failure: hardware capacity and performance' },
    { value: 'system_failure_hardware_maintenance', label: 'system failure: hardware maintenance' },
    { value: 'system_failure_hardware_obsolescence', label: 'system failure: hardware obsolescence/ageing' },
    { value: 'system_failure_software_compatibility', label: 'system failure: software compatibility/configuration' },
    { value: 'system_failure_software_performance', label: 'system failure: software performance' },
    { value: 'system_failure_network_configuration', label: 'system failure: network configuration' },
    { value: 'system_failure_physical_damage', label: 'system failure: physical damage' },
    { value: 'system_failure_other', label: 'system failure: other (please specify)' },
    { value: 'human_error_omission', label: 'human error: omission' },
    { value: 'human_error_mistake', label: 'human error: mistake' },
    { value: 'human_error_skills_knowledge', label: 'human error: skills & knowledge' },
    { value: 'human_error_inadequate_resources', label: 'human error: inadequate human resources' },
    { value: 'human_error_miscommunication', label: 'human error miscommunication' },
    { value: 'human_error_other', label: 'human error: other (please specify)' },
    { value: 'external_event_natural_disasters', label: 'external event: natural disasters/force majeure' },
    { value: 'external_event_third_party_failures', label: 'external event: third-party failures' },
    { value: 'external_event_other', label: 'external event: other (please specify)' }
  ];

  // Options for Additional classification of root causes of the incident (field 4.3)
  additionalClassificationRootCausesOptions = [
    { value: 'monitoring_policy_adherence', label: 'monitoring of policy adherence' },
    { value: 'monitoring_third_party_providers', label: 'monitoring of third-party service providers' },
    { value: 'monitoring_remediation_vulnerabilities', label: 'monitoring and verification of remediation of vulnerabilities' },
    { value: 'identity_access_management', label: 'identity and access management' },
    { value: 'encryption_cryptography', label: 'encryption and cryptography' },
    { value: 'logging', label: 'logging' },
    { value: 'failure_risk_tolerance_levels', label: 'failure in specifying accurate risk tolerance levels' },
    { value: 'insufficient_vulnerability_assessments', label: 'insufficient vulnerability and threat assessments' },
    { value: 'inadequate_risk_treatment', label: 'inadequate risk treatment measures' },
    { value: 'poor_management_residual_risks', label: 'poor management of residual ICT risks' },
    { value: 'vulnerability_patch_management', label: 'vulnerability and patch management' },
    { value: 'change_management', label: 'change management' },
    { value: 'capacity_performance_management', label: 'capacity and performance management' },
    { value: 'ict_asset_management', label: 'ICT asset management and information classification' },
    { value: 'backup_restore', label: 'backup and restore' },
    { value: 'error_handling', label: 'error handling' },
    { value: 'inadequate_ict_systems', label: 'inadequate ICT systems acquisition, development, and maintenance' },
    { value: 'insufficient_software_testing', label: 'insufficient or failure of software testing' }
  ];

  constructor(private fb: FormBuilder) {
    this.reportingForm = this.fb.group({
      highLevelClassificationRootCauses: [[]], // field 4.1
      detailedClassificationRootCauses: [[]], // field 4.2
      additionalClassificationRootCauses: [[]], // field 4.3
      otherTypesOfRootCauseTypes: ['', Validators.maxLength(1000)], // field 4.4
      informationAboutRootCauses: ['', Validators.maxLength(1000)], // field 4.5
      incidentResolution: ['', Validators.maxLength(1000)] // field 4.6
    });
  }

  ngOnInit(): void {
  }
} 
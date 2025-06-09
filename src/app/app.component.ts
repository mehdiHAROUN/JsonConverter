import { Component } from '@angular/core';
import { IncidentReportFormComponent } from './components/incident-report-form/incident-report-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IncidentReportFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jason-converter';
}

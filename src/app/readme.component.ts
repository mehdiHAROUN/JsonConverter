import { Component } from '@angular/core';

@Component({
  selector: 'app-readme',
  template: `
    <p>
      The project has been generated, sample pages are available on the header
      of the application.
    </p>
    <h2>Next Steps</h2>
    <p>
      If you want your picture as an avatar, you should update the configuration
      of the api. No default is currently provided, so it will not work until
      you do. You can delete that part otherwise.
    </p>
    <p>
      You need to create an application in
      <a target="_blank" href="https://intact-beta.gems.myengie.com/">intact</a>
      and to update the client id and the scopes that you find in the env.json,
      and change the scope used in the backend.
    </p>
    <p>
      Web Factory doesn't handle the deployment at the moment. You still need to
      create the necessary servers and create the release pipeline
    </p>
  `,
  standalone: true,
})
export class ReadmeComponent {}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/token';

@Injectable()
export class UserService {
  #http = inject(HttpClient);
  #url = inject(API_URL);

}

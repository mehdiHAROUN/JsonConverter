import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  authentication: {
    issuer: string;
    clientId: string;
    redirectUri: string;
  };
}

export interface ApiConfig {
  baseUrl: string;
}

// Default environment configuration - Okta disabled for now
export const environment: Environment = {
  production: false,
  authentication: {
    // Temporary placeholder values - Okta authentication disabled
    issuer: 'https://your-okta-domain.okta.com/oauth2/default',
    clientId: 'your-client-id',
    redirectUri: window.location.origin + '/login/callback'
  }
};

// API configuration
export const apiConfig: ApiConfig = {
  baseUrl: 'https://your-api-domain.com/api'
};

// Injection tokens
export const ENVIRONMENT = new InjectionToken<Environment>('environment');
export const API_URL = new InjectionToken<string>('api.url');

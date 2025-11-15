/**
 * System Authentication Types
 */

export interface SystemCredentials {
  system_name: string;
  system_key: string;
}

export interface AuthResult {
  authenticated: boolean;
  systemName?: string;
  error?: string;
}

export interface TrustedSystem {
  system_name: string;
  system_key: string;
  description: string;
  enabled: boolean;
}

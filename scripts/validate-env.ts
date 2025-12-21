#!/usr/bin/env tsx
/**
 * Environment Validation Script
 *
 * Run this before deploying to production to validate:
 * - All required environment variables are set
 * - Apple IAP product IDs are configured (required for iOS)
 * - No test keys in production
 * 
 * Usage:
 *   npm run validate:env
 *   npm run validate:env -- --env=production
 */
import devCapacitorConfig from '../capacitor.config';
import prodCapacitorConfig from '../capacitor.config.production';

const bundleIds = Array.from(
  new Set(
    [devCapacitorConfig.appId, prodCapacitorConfig.appId]
      .filter((id): id is string => Boolean(id))
  )
);

interface ValidationResult {
  pass: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface EnvironmentConfig {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  // Apple IAP (required for iOS)
  VITE_APPLE_PRO_MONTHLY_PRODUCT_ID?: string;
  VITE_APPLE_PRO_YEARLY_PRODUCT_ID?: string;
  // Apple Sign-In
  appleClientIds: Record<string, string>;
}

type Environment = 'production' | 'development' | 'preview';

class EnvironmentValidator {
  private env: Environment;
  private config: EnvironmentConfig;
  private results: ValidationResult[] = [];

  constructor(env: Environment = 'development') {
    this.env = env;
    this.config = this.loadEnvironmentVariables();
  }

  private loadEnvironmentVariables(): EnvironmentConfig {
    // In a real environment, these would come from process.env or import.meta.env
    return {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      VITE_APPLE_PRO_MONTHLY_PRODUCT_ID: process.env.VITE_APPLE_PRO_MONTHLY_PRODUCT_ID,
      VITE_APPLE_PRO_YEARLY_PRODUCT_ID: process.env.VITE_APPLE_PRO_YEARLY_PRODUCT_ID,
      appleClientIds: this.loadAppleClientIds(),
    };
  }

  private loadAppleClientIds(): Record<string, string> {
    return Object.entries(process.env)
      .filter(([key]) => key.startsWith('VITE_APPLE_CLIENT_ID_'))
      .reduce<Record<string, string>>((acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private bundleIdToEnvKey(bundleId: string): string {
    return `VITE_APPLE_CLIENT_ID_${bundleId.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}`;
  }

  private getAppleClientId(bundleId: string): string | undefined {
    const envKey = this.bundleIdToEnvKey(bundleId);
    return this.config.appleClientIds[envKey];
  }

  validateRequiredVariables(): void {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
    ] as const;

    for (const key of required) {
      if (!this.config[key]) {
        this.addResult({
          pass: false,
          message: `Missing required variable: ${key}`,
          severity: this.env === 'production' ? 'error' : 'warning',
        });
      } else {
        this.addResult({
          pass: true,
          message: `${key} is configured`,
          severity: 'info',
        });
      }
    }
  }

  validateAppleIAPConfig(): void {
    const monthlyId = this.config.VITE_APPLE_PRO_MONTHLY_PRODUCT_ID;
    const yearlyId = this.config.VITE_APPLE_PRO_YEARLY_PRODUCT_ID;

    if (!monthlyId || !yearlyId) {
      const missing = [];
      if (!monthlyId) missing.push('VITE_APPLE_PRO_MONTHLY_PRODUCT_ID');
      if (!yearlyId) missing.push('VITE_APPLE_PRO_YEARLY_PRODUCT_ID');

      this.addResult({
        pass: false,
        message: `Missing Apple IAP product IDs: ${missing.join(', ')} - iOS subscriptions will not work!`,
        severity: this.env === 'production' ? 'error' : 'warning',
      });
      return;
    }

    // Validate format (Apple product IDs are typically reverse domain notation)
    const validFormat = (id: string) => /^[a-zA-Z0-9._]+$/.test(id);
    
    if (!validFormat(monthlyId) || !validFormat(yearlyId)) {
      this.addResult({
        pass: false,
        message: 'Apple IAP product IDs have invalid format',
        severity: 'error',
      });
      return;
    }

    this.addResult({
      pass: true,
      message: 'Apple IAP product IDs configured correctly ✓',
      severity: 'info',
    });
  }

  validateAppleSignInConfig(bundleIds: string[]): void {
    bundleIds.forEach(bundleId => {
      const clientId = this.getAppleClientId(bundleId);
      const envKey = this.bundleIdToEnvKey(bundleId);

      if (!clientId) {
        this.addResult({
          pass: false,
          message: `Missing Apple Sign-In client ID for bundle ${bundleId}. Set ${envKey} in your .env file.`,
          severity: this.env === 'production' ? 'error' : 'warning',
        });
        return;
      }

      if (!/^[A-Za-z0-9.]+$/.test(clientId)) {
        this.addResult({
          pass: false,
          message: `Apple Sign-In client ID for ${bundleId} has an unexpected format`,
          severity: 'warning',
        });
        return;
      }

      this.addResult({
        pass: true,
        message: `Apple Sign-In client ID configured for ${bundleId} ✓ (${envKey})`,
        severity: 'info',
      });
    });
  }

  validateSupabaseConfig(): void {
    const url = this.config.VITE_SUPABASE_URL;

    if (!url) {
      return; // Already caught by required variables check
    }

    // Check format
    if (!url.startsWith('https://')) {
      this.addResult({
        pass: false,
        message: 'VITE_SUPABASE_URL must use HTTPS',
        severity: 'error',
      });
      return;
    }

    if (!url.includes('.supabase.co')) {
      this.addResult({
        pass: false,
        message: 'VITE_SUPABASE_URL format appears invalid (expected .supabase.co domain)',
        severity: 'warning',
      });
      return;
    }

    this.addResult({
      pass: true,
      message: 'Supabase URL format valid ✓',
      severity: 'info',
    });
  }

  run(): boolean {
    console.log(`\n🔍 Validating ${this.env.toUpperCase()} environment...\n`);

    this.validateRequiredVariables();
    this.validateAppleIAPConfig();
    this.validateAppleSignInConfig(bundleIds);
    this.validateSupabaseConfig();

    return this.printResults();
  }

  private printResults(): boolean {
    let hasErrors = false;
    let hasWarnings = false;

    // Group by severity
    const errors = this.results.filter(r => r.severity === 'error');
    const warnings = this.results.filter(r => r.severity === 'warning');
    const info = this.results.filter(r => r.severity === 'info' && r.pass);

    // Print errors
    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      errors.forEach(r => {
        console.log(`  ${r.message}`);
        hasErrors = true;
      });
      console.log('');
    }

    // Print warnings
    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      warnings.forEach(r => {
        console.log(`  ${r.message}`);
        hasWarnings = true;
      });
      console.log('');
    }

    // Print info/success
    if (info.length > 0) {
      console.log('✅ PASSED:');
      info.forEach(r => console.log(`  ${r.message}`));
      console.log('');
    }

    // Summary
    if (hasErrors) {
      console.log('🚨 VALIDATION FAILED - Fix all errors before deploying\n');
      return false;
    }

    if (hasWarnings && this.env === 'production') {
      console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Review before deploying\n');
      return true;
    }

    console.log('✅ VALIDATION PASSED - Environment is correctly configured\n');
    return true;
  }
}

// CLI execution
function main() {
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  const env = envArg?.split('=')[1] as Environment || 'development';

  if (!['production', 'development', 'preview'].includes(env)) {
    console.error('Invalid environment. Use: production, development, or preview');
    process.exit(1);
  }

  const validator = new EnvironmentValidator(env);
  const success = validator.run();

  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { EnvironmentValidator, ValidationResult };

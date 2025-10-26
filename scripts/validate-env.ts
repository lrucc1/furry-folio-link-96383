#!/usr/bin/env tsx
/**
 * Environment Validation Script
 * 
 * Run this before deploying to production to validate:
 * - All required environment variables are set
 * - Stripe keys match the intended environment
 * - No test keys in production
 * - No live keys in development
 * 
 * Usage:
 *   npm run validate:env
 *   npm run validate:env -- --env=production
 */

interface ValidationResult {
  pass: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface EnvironmentConfig {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_STRIPE_PRICE_PRO_MONTHLY_AUD?: string;
  VITE_STRIPE_PRICE_PRO_YEARLY_AUD?: string;
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
      VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_STRIPE_PRICE_PRO_MONTHLY_AUD: process.env.VITE_STRIPE_PRICE_PRO_MONTHLY_AUD,
      VITE_STRIPE_PRICE_PRO_YEARLY_AUD: process.env.VITE_STRIPE_PRICE_PRO_YEARLY_AUD,
    };
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
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

  validateStripeKeys(): void {
    const publishableKey = this.config.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      this.addResult({
        pass: false,
        message: 'VITE_STRIPE_PUBLISHABLE_KEY is not configured',
        severity: 'warning',
      });
      return;
    }

    const isTestKey = publishableKey.startsWith('pk_test_');
    const isLiveKey = publishableKey.startsWith('pk_live_');

    if (!isTestKey && !isLiveKey) {
      this.addResult({
        pass: false,
        message: 'VITE_STRIPE_PUBLISHABLE_KEY has invalid format (must start with pk_test_ or pk_live_)',
        severity: 'error',
      });
      return;
    }

    // Production MUST use live keys
    if (this.env === 'production' && isTestKey) {
      this.addResult({
        pass: false,
        message: '🚨 CRITICAL: Production is using Stripe TEST keys! This will prevent real payments.',
        severity: 'error',
      });
      return;
    }

    // Development should use test keys
    if (this.env !== 'production' && isLiveKey) {
      this.addResult({
        pass: false,
        message: '⚠️ WARNING: Non-production environment is using Stripe LIVE keys! This could result in real charges.',
        severity: 'warning',
      });
      return;
    }

    this.addResult({
      pass: true,
      message: `Stripe keys validated: ${this.env} using ${isTestKey ? 'TEST' : 'LIVE'} keys ✓`,
      severity: 'info',
    });
  }

  validateStripePrices(): void {
    const monthly = this.config.VITE_STRIPE_PRICE_PRO_MONTHLY_AUD;
    const yearly = this.config.VITE_STRIPE_PRICE_PRO_YEARLY_AUD;

    if (!monthly || !yearly) {
      const missing = [];
      if (!monthly) missing.push('VITE_STRIPE_PRICE_PRO_MONTHLY_AUD');
      if (!yearly) missing.push('VITE_STRIPE_PRICE_PRO_YEARLY_AUD');

      this.addResult({
        pass: false,
        message: `Missing Stripe price IDs: ${missing.join(', ')}`,
        severity: this.env === 'production' ? 'error' : 'warning',
      });
      return;
    }

    // Validate format
    const monthlyValid = monthly.startsWith('price_');
    const yearlyValid = yearly.startsWith('price_');

    if (!monthlyValid || !yearlyValid) {
      this.addResult({
        pass: false,
        message: 'Stripe price IDs have invalid format (must start with price_)',
        severity: 'error',
      });
      return;
    }

    this.addResult({
      pass: true,
      message: 'Stripe price IDs configured correctly ✓',
      severity: 'info',
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
    this.validateStripeKeys();
    this.validateStripePrices();
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

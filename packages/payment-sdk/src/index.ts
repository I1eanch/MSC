export type PaymentEnvironment = 'sandbox' | 'production';

export interface PaymentClientConfig {
  environment: PaymentEnvironment;
  publishableKey: string;
  simulateLatencyMs?: number;
}

export interface CheckoutRequest {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSuccess {
  success: true;
  transactionId: string;
  processedAt: string;
  provider: 'cto-payments';
}

export interface CheckoutFailure {
  success: false;
  processedAt: string;
  errorCode: string;
  message: string;
}

export type CheckoutResult = CheckoutSuccess | CheckoutFailure;

export class PaymentClient {
  private readonly config: PaymentClientConfig;

  constructor(config: PaymentClientConfig) {
    if (!config.publishableKey) {
      throw new Error('PaymentClient requires a publishable key');
    }

    this.config = config;
  }

  get environment(): PaymentEnvironment {
    return this.config.environment;
  }

  async startCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    await this.simulateLatency();

    if (this.shouldSimulateFailure(request)) {
      return {
        success: false,
        processedAt: new Date().toISOString(),
        errorCode: 'payment_failed',
        message: 'The transaction could not be completed',
      };
    }

    return {
      success: true,
      transactionId: this.generateTransactionId(request.planId),
      processedAt: new Date().toISOString(),
      provider: 'cto-payments',
    };
  }

  private async simulateLatency(): Promise<void> {
    const latency = this.config.simulateLatencyMs ?? (this.config.environment === 'sandbox' ? 600 : 350);

    await new Promise((resolve) => setTimeout(resolve, latency));
  }

  private shouldSimulateFailure(request: CheckoutRequest): boolean {
    if (this.config.environment === 'production') {
      return false;
    }

    if (request.metadata && request.metadata['forceFailure'] === true) {
      return true;
    }

    return false;
  }

  private generateTransactionId(planId: string): string {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `txn_${planId}_${suffix}`;
  }
}

export function createPaymentClient(config: PaymentClientConfig): PaymentClient {
  return new PaymentClient(config);
}

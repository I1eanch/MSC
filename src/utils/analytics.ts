export type AnalyticsEvent =
  | 'screen_view'
  | 'button_click'
  | 'signup_started'
  | 'signup_completed'
  | 'signup_failed'
  | 'login_started'
  | 'login_completed'
  | 'login_failed'
  | 'forgot_password_started'
  | 'forgot_password_completed'
  | 'forgot_password_failed'
  | 'benefits_carousel_viewed'
  | 'benefits_carousel_completed';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (!this.enabled) return;

    console.log('[Analytics]', event, properties);
  }

  trackScreenView(screenName: string, properties?: AnalyticsProperties) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  trackButtonClick(buttonName: string, screenName: string, properties?: AnalyticsProperties) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      screen_name: screenName,
      ...properties,
    });
  }

  trackSignupStarted(properties?: AnalyticsProperties) {
    this.trackEvent('signup_started', properties);
  }

  trackSignupCompleted(properties?: AnalyticsProperties) {
    this.trackEvent('signup_completed', properties);
  }

  trackSignupFailed(error: string, properties?: AnalyticsProperties) {
    this.trackEvent('signup_failed', {
      error,
      ...properties,
    });
  }

  trackLoginStarted(properties?: AnalyticsProperties) {
    this.trackEvent('login_started', properties);
  }

  trackLoginCompleted(properties?: AnalyticsProperties) {
    this.trackEvent('login_completed', properties);
  }

  trackLoginFailed(error: string, properties?: AnalyticsProperties) {
    this.trackEvent('login_failed', {
      error,
      ...properties,
    });
  }

  trackForgotPasswordStarted(properties?: AnalyticsProperties) {
    this.trackEvent('forgot_password_started', properties);
  }

  trackForgotPasswordCompleted(properties?: AnalyticsProperties) {
    this.trackEvent('forgot_password_completed', properties);
  }

  trackForgotPasswordFailed(error: string, properties?: AnalyticsProperties) {
    this.trackEvent('forgot_password_failed', {
      error,
      ...properties,
    });
  }

  trackBenefitsCarouselViewed(slideIndex: number, properties?: AnalyticsProperties) {
    this.trackEvent('benefits_carousel_viewed', {
      slide_index: slideIndex,
      ...properties,
    });
  }

  trackBenefitsCarouselCompleted(properties?: AnalyticsProperties) {
    this.trackEvent('benefits_carousel_completed', properties);
  }
}

export const analytics = new Analytics();

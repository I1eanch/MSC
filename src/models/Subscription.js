const { v4: uuidv4 } = require('uuid');

class Subscription {
  constructor({ id, userId, planId, status, currentPeriodStart, currentPeriodEnd, trialEnd, cancelAtPeriodEnd, entitlements }) {
    this.id = id || uuidv4();
    this.userId = userId;
    this.planId = planId;
    this.status = status; // 'active', 'trialing', 'canceled', 'past_due', 'unpaid'
    this.currentPeriodStart = currentPeriodStart || new Date();
    this.currentPeriodEnd = currentPeriodEnd || this.calculatePeriodEnd();
    this.trialEnd = trialEnd;
    this.cancelAtPeriodEnd = cancelAtPeriodEnd || false;
    this.entitlements = entitlements || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  calculatePeriodEnd(interval = 'month') {
    const end = new Date();
    if (interval === 'month') {
      end.setMonth(end.getMonth() + 1);
    } else if (interval === 'year') {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end;
  }

  isActive() {
    return this.status === 'active' || this.status === 'trialing';
  }

  isInTrial() {
    return this.status === 'trialing' && this.trialEnd && this.trialEnd > new Date();
  }

  isExpired() {
    return this.currentPeriodEnd < new Date();
  }

  hasEntitlement(entitlement) {
    return this.entitlements.includes(entitlement);
  }

  updateStatus(status) {
    this.status = status;
    this.updatedAt = new Date();
  }

  extendSubscription(interval = 'month') {
    this.currentPeriodStart = new Date();
    this.currentPeriodEnd = this.calculatePeriodEnd(interval);
    this.updatedAt = new Date();
  }

  cancel() {
    this.cancelAtPeriodEnd = true;
    this.updatedAt = new Date();
  }
}

module.exports = Subscription;
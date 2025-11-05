class OnboardingWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.storageKey = 'onboarding_progress';
        
        this.init();
    }

    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.updateProgress();
        this.trackAnalytics('onboarding_started', { step: this.currentStep });
    }

    loadProgress() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.formData = parsed.formData || {};
                this.currentStep = parsed.currentStep || 1;
                this.restoreFormValues();
                this.showToast('Welcome back! Your progress has been restored.', 'success');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    saveProgress() {
        try {
            const data = {
                formData: this.formData,
                currentStep: this.currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    clearProgress() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    }

    restoreFormValues() {
        if (this.formData.age) {
            document.getElementById('age').value = this.formData.age;
        }

        if (this.formData.objectives) {
            this.formData.objectives.forEach(value => {
                const checkbox = document.querySelector(`input[name="objectives"][value="${value}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        if (this.formData.fitnessLevel) {
            const radio = document.querySelector(`input[name="fitnessLevel"][value="${this.formData.fitnessLevel}"]`);
            if (radio) radio.checked = true;
        }

        if (this.formData.healthNotes) {
            const textarea = document.getElementById('healthNotes');
            textarea.value = this.formData.healthNotes;
            this.updateCharCount();
        }
    }

    setupEventListeners() {
        document.getElementById('nextBtn1')?.addEventListener('click', () => this.nextStep(1));
        document.getElementById('nextBtn2')?.addEventListener('click', () => this.nextStep(2));
        document.getElementById('nextBtn3')?.addEventListener('click', () => this.nextStep(3));
        
        document.getElementById('backBtn2')?.addEventListener('click', () => this.prevStep(2));
        document.getElementById('backBtn3')?.addEventListener('click', () => this.prevStep(3));
        document.getElementById('backBtn4')?.addEventListener('click', () => this.prevStep(4));

        const form = document.getElementById('onboardingForm');
        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        document.getElementById('age')?.addEventListener('input', (e) => {
            this.clearError('age');
            this.formData.age = e.target.value;
            this.saveProgress();
        });

        document.querySelectorAll('input[name="objectives"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.clearError('objectives');
                this.formData.objectives = Array.from(
                    document.querySelectorAll('input[name="objectives"]:checked')
                ).map(cb => cb.value);
                this.saveProgress();
            });
        });

        document.querySelectorAll('input[name="fitnessLevel"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.clearError('fitnessLevel');
                this.formData.fitnessLevel = e.target.value;
                this.saveProgress();
            });
        });

        const healthNotesTextarea = document.getElementById('healthNotes');
        healthNotesTextarea?.addEventListener('input', (e) => {
            this.clearError('healthNotes');
            this.formData.healthNotes = e.target.value;
            this.updateCharCount();
            this.saveProgress();
        });
    }

    nextStep(step) {
        if (this.validateStep(step)) {
            this.currentStep++;
            this.updateView();
            this.saveProgress();
            this.trackAnalytics('onboarding_step_completed', { 
                step: step,
                nextStep: this.currentStep 
            });
        }
    }

    prevStep(step) {
        this.currentStep--;
        this.updateView();
        this.saveProgress();
        this.trackAnalytics('onboarding_step_back', { 
            fromStep: step,
            toStep: this.currentStep 
        });
    }

    validateStep(step) {
        let isValid = true;

        switch (step) {
            case 1:
                const age = document.getElementById('age');
                const ageValue = parseInt(age.value);

                if (!age.value) {
                    this.showError('age', 'Please enter your age');
                    isValid = false;
                } else if (ageValue < 13 || ageValue > 120) {
                    this.showError('age', 'Please enter a valid age between 13 and 120');
                    isValid = false;
                } else {
                    this.formData.age = ageValue;
                }
                break;

            case 2:
                const objectives = document.querySelectorAll('input[name="objectives"]:checked');
                if (objectives.length === 0) {
                    this.showError('objectives', 'Please select at least one objective');
                    isValid = false;
                } else {
                    this.formData.objectives = Array.from(objectives).map(cb => cb.value);
                }
                break;

            case 3:
                const fitnessLevel = document.querySelector('input[name="fitnessLevel"]:checked');
                if (!fitnessLevel) {
                    this.showError('fitnessLevel', 'Please select your fitness level');
                    isValid = false;
                } else {
                    this.formData.fitnessLevel = fitnessLevel.value;
                }
                break;

            case 4:
                const healthNotes = document.getElementById('healthNotes').value;
                this.formData.healthNotes = healthNotes.trim();
                break;
        }

        if (!isValid) {
            this.trackAnalytics('onboarding_validation_error', { 
                step: step,
                field: this.getFieldNameForStep(step)
            });
        }

        return isValid;
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    updateView() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        const activeStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (activeStep) {
            activeStep.classList.add('active');
        }

        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        this.updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const percentage = (this.currentStep / this.totalSteps) * 100;
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateCharCount() {
        const textarea = document.getElementById('healthNotes');
        const charCount = document.getElementById('charCount');
        if (textarea && charCount) {
            charCount.textContent = textarea.value.length;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateStep(4)) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';

        try {
            this.trackAnalytics('onboarding_submit_attempted', this.formData);

            const response = await this.submitOnboarding(this.formData);

            if (response.success) {
                this.trackAnalytics('onboarding_completed', { 
                    ...this.formData,
                    userId: response.userId 
                });
                
                this.clearProgress();
                this.showToast('Onboarding completed successfully!', 'success');

                setTimeout(() => {
                    this.routeToDashboard(response.userId);
                }, 1500);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.trackAnalytics('onboarding_submit_failed', { 
                error: error.message,
                formData: this.formData
            });
            
            this.showToast(error.message || 'Failed to submit. Please try again.', 'error');
            
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    async submitOnboarding(data) {
        const API_ENDPOINT = '/api/onboarding';
        
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.warn('API endpoint not available, using mock response for demo');
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            success: true,
                            userId: 'user_' + Date.now(),
                            message: 'Onboarding completed successfully'
                        });
                    }, 1500);
                });
            }
            throw error;
        }
    }

    routeToDashboard(userId) {
        const dashboardUrl = `/dashboard.html?userId=${userId}`;
        window.location.href = dashboardUrl;
    }

    trackAnalytics(eventName, eventData) {
        try {
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, eventData);
            }

            if (typeof window.analytics !== 'undefined' && window.analytics.track) {
                window.analytics.track(eventName, eventData);
            }

            if (typeof window.mixpanel !== 'undefined' && window.mixpanel.track) {
                window.mixpanel.track(eventName, eventData);
            }

            console.log('Analytics Event:', eventName, eventData);
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'block';

            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }

    getFieldNameForStep(step) {
        const fields = {
            1: 'age',
            2: 'objectives',
            3: 'fitnessLevel',
            4: 'healthNotes'
        };
        return fields[step] || 'unknown';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OnboardingWizard();
});

export interface ContactFormData {
  fullName: string;
  contactMethod: string;
  program: string;
  inquiryType: string;
  message: string;
  consentAgreed: boolean;
}

export interface ValidationErrors {
  fullName?: string;
  contactMethod?: string;
  message?: string;
  consentAgreed?: string;
}

export function validateContactForm(data: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter at least 2 characters.';
  } else if (data.fullName.length > 80) {
    errors.fullName = 'Name cannot exceed 80 characters.';
  }

  if (!data.contactMethod.trim()) {
    errors.contactMethod = 'Please provide an email or phone number for follow-up.';
  } else if (data.contactMethod.trim().length < 5) {
    errors.contactMethod = 'Please enter a valid email address or phone number.';
  } else if (data.contactMethod.length > 100) {
    errors.contactMethod = 'Contact value is too long.';
  }

  if (!data.message.trim()) {
    errors.message = 'Please include a brief message or question.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Please provide a little more detail (at least 10 characters).';
  } else if (data.message.length > 1500) {
    errors.message = 'Message must be under 1500 characters.';
  }

  if (!data.consentAgreed) {
    errors.consentAgreed = 'You must acknowledge the communication notice to proceed.';
  }

  return errors;
}

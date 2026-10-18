import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Mail, AlertCircle, CheckCircle2, Send, HelpCircle, Phone, ExternalLink } from 'lucide-react';
import { siteConfig } from '../content/site';
import { programs } from '../content/programs';
import { ContactFormData, ValidationErrors, validateContactForm } from '../lib/validation';
import { updatePageSeo } from '../utils/seo';
import { PageBanner } from '../components/ui/PageBanner';
import { getPageContent, PageContentData } from '../services/pageService';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedProgram = searchParams.get('program') || '';
  const [pageData, setPageData] = useState<PageContentData | null>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    contactMethod: '',
    program: preselectedProgram,
    inquiryType: 'Program Enrollment',
    message: '',
    consentAgreed: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submissionState, setSubmissionState] = useState<'idle' | 'reviewed'>('idle');

  useEffect(() => {
    getPageContent('contact', 'published').then((data) => {
      setPageData(data);
      updatePageSeo({
        title: data?.seo?.metaTitle || 'Contact MindSparQ | Inquiries & School Partnerships',
        description: data?.seo?.metaDescription || 'Connect with MindSparQ Education & Technology in Butwal, Nepal. Inquire about student enrollment, school partnerships, and STEM workshops.',
        canonicalPath: data?.seo?.canonicalPath || '/contact',
        ogType: 'website'
      });
    });
  }, []);

  useEffect(() => {
    if (preselectedProgram) {
      setFormData(prev => ({ ...prev, program: preselectedProgram }));
    }
  }, [preselectedProgram]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));

    // Clear individual error when user edits
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Truthful client handling:
      // We do not fake a remote database or backend call
      setSubmissionState('reviewed');
    }
  };

  const handleCreateMailto = () => {
    const subject = encodeURIComponent(`MindSparQ Inquiry: ${formData.inquiryType} - ${formData.fullName}`);
    const body = encodeURIComponent(
      `Name: ${formData.fullName}\nContact: ${formData.contactMethod}\nInquiry Type: ${formData.inquiryType}\nProgram of Interest: ${formData.program || 'Not specified'}\n\nMessage:\n${formData.message}\n`
    );
    // If official email is set, use it; otherwise provide mailto link draft
    const recipient = siteConfig.contact.email || '';
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Page Hero Banner */}
      <PageBanner
        eyebrowIcon={<Mail size={14} />}
        eyebrowText="Admissions & Institutional Partnerships"
        title={pageData?.title || "Get in Touch with MindSparQ"}
        subtitle={pageData?.subtitle || "Have questions about student enrollment, batch timings, our Butwal center, or establishing a school STEM club partnership? Reach out to our academic counselors."}
        backgroundImageUrl={pageData?.heroImageUrl || "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=80"}
        badges={[
          { icon: <MapPin size={13} />, label: 'Butwal-11, Rupandehi, Nepal', variant: 'primary' },
          { icon: <Phone size={13} />, label: siteConfig.contact.phone || '+977-9800000000', variant: 'neutral' },
          { icon: <Mail size={13} />, label: siteConfig.contact.email || 'info@mindsparqeducation.com.np', variant: 'accent' }
        ]}
      />

      {/* Main Form & Location Info */}
      <section className="section-spacing">
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--space-12)'
            }}
            className="contact-layout-grid"
          >
            {/* Form Column */}
            <div>
              <div 
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: 'var(--space-8)'
                }}
              >
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                  Inquiry Form
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                  Fill out your details below. All information submitted here is kept private and used exclusively to respond to your specific inquiry.
                </p>

                {submissionState === 'reviewed' ? (
                  <div 
                    style={{
                      padding: 'var(--space-6)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-brand-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', color: 'var(--color-brand-primary)' }}>
                      <CheckCircle2 size={24} />
                      <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Inquiry Ready for Dispatch</h3>
                    </div>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                      Your inquiry details have been verified locally. You can open your default email app to transmit this draft directly, or copy the formatted summary for your in-person visit at our Butwal office.
                    </p>

                    <div 
                      style={{
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'monospace',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-6)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      <strong>Inquirer:</strong> {formData.fullName} ({formData.contactMethod})<br />
                      <strong>Type:</strong> {formData.inquiryType}<br />
                      <strong>Program:</strong> {formData.program || 'General Inquiry'}<br />
                      <strong>Message:</strong> {formData.message}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <button 
                        type="button" 
                        onClick={handleCreateMailto}
                        className="btn btn-primary"
                      >
                        <Send size={16} />
                        <span>Open in Email App</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSubmissionState('idle')}
                        className="btn btn-secondary"
                      >
                        <span>Edit Form</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name */}
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        Your Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Suman Sharma"
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      />
                      {errors.fullName && (
                        <div id="fullName-error" className="form-error">
                          <AlertCircle size={14} /> {errors.fullName}
                        </div>
                      )}
                    </div>

                    {/* Contact Method */}
                    <div className="form-group">
                      <label htmlFor="contactMethod" className="form-label">
                        Email Address or Mobile Phone <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="contactMethod"
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleChange}
                        placeholder="e.g. suman@example.com or 98XXXXXXXX"
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.contactMethod}
                        aria-describedby={errors.contactMethod ? 'contactMethod-error' : undefined}
                      />
                      {errors.contactMethod && (
                        <div id="contactMethod-error" className="form-error">
                          <AlertCircle size={14} /> {errors.contactMethod}
                        </div>
                      )}
                    </div>

                    {/* Inquiry Type & Program Selection (2 columns on wider screens) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label htmlFor="inquiryType" className="form-label">
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="Program Enrollment">Student / Program Enrollment</option>
                          <option value="School Partnership">School STEM / Math Partnership</option>
                          <option value="Teacher Training">Teacher Training Workshop</option>
                          <option value="General Question">General Inquiry</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="program" className="form-label">
                          Program of Interest (Optional)
                        </label>
                        <select
                          id="program"
                          name="program"
                          value={formData.program}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">-- Choose a program --</option>
                          {programs.map((p) => (
                            <option key={p.id} value={p.title}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">
                        Inquiry Details / Message <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please share learner's approximate grade level, specific questions about syllabus, batch timing preferences, or school collaboration requirements."
                        className="form-textarea"
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <div id="message-error" className="form-error">
                          <AlertCircle size={14} /> {errors.message}
                        </div>
                      )}
                    </div>

                    {/* Consent Checkbox */}
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="consentAgreed"
                        name="consentAgreed"
                        checked={formData.consentAgreed}
                        onChange={handleChange}
                        style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--color-brand-primary)' }}
                        aria-required="true"
                      />
                      <label htmlFor="consentAgreed" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        I confirm that the contact information supplied is accurate and authorize MindSparQ to contact me regarding this educational inquiry.
                      </label>
                    </div>
                    {errors.consentAgreed && (
                      <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertCircle size={14} /> {errors.consentAgreed}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <span>Review & Submit Inquiry</span>
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Location & Official Contacts Column */}
            <div>
              <div 
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: 'var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)'
                }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                    Physical Center
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Our primary academic center and administrative desk:
                  </p>
                </div>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <MapPin size={24} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Registered Location
                    </span>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', margin: '4px 0 0 0', fontWeight: 600 }}>
                      {siteConfig.location.fullFormatted}
                    </p>
                    {siteConfig.location.mapQueryUrl && (
                      <a 
                        href={siteConfig.location.mapQueryUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', marginTop: '8px' }}
                      >
                        <span>View area on Google Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Contact Transparency Disclosure */}
                <div 
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                    <HelpCircle size={15} style={{ color: 'var(--color-accent-teal)' }} />
                    <span>Communications Transparency</span>
                  </div>
                  Direct telephone numbers and email dispatch mailboxes are undergoing central confirmation by the administration. In the interim, inquiry submissions prepared above can be handled via mail client or during consultation at Gyanbhoomi Path, Butwal.
                </div>

                {/* Verified phone/email if supplied */}
                {(siteConfig.contact.phone || siteConfig.contact.email) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {siteConfig.contact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)' }}>
                        <Phone size={18} style={{ color: 'var(--color-brand-primary)' }} />
                        <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a>
                      </div>
                    )}
                    {siteConfig.contact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)' }}>
                        <Mail size={18} style={{ color: 'var(--color-brand-primary)' }} />
                        <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .contact-layout-grid {
              grid-template-columns: 1.25fr 0.85fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};

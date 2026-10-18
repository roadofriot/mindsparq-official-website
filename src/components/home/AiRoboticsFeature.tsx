import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Terminal, Sparkles, Layers, ArrowRight } from 'lucide-react';

import { SiteSection } from '../../services/siteCustomizerService';

interface AiRoboticsFeatureProps {
  section?: SiteSection;
}

export const AiRoboticsFeature: React.FC<AiRoboticsFeatureProps> = ({ section }) => {
  const eyebrowText = section?.badge || 'Technology & Future Skills';
  const titleText = section?.title || 'Connecting Coding, Electronics, and Creative Thinking';
  const descText = section?.subtitle || 'In an era powered by intelligent computing, our robotics and coding pathways help young learners move from passive consumers of technology to confident problem creators and engineers.';

  return (
    <section 
      data-cms-section={section?.id || 'ai_robotics_feature'}
      className="section-spacing"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-12)',
            alignItems: 'center'
          }}
          className="feature-grid"
        >
          {/* Text Side */}
          <div>
            <div className="eyebrow eyebrow-teal" data-cms-field="badge">
              <Cpu size={14} />
              <span>{eyebrowText}</span>
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }} data-cms-field="title">
              {titleText}
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }} data-cms-field="subtitle">
              {descText}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <Terminal size={18} style={{ color: 'var(--color-brand-primary)', marginBottom: '4px' }} />
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: '2px' }}>Algorithmic Thinking</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Structured logic from scratch blocks to syntax fundamentals.
                </p>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <Layers size={18} style={{ color: 'var(--color-accent-teal)', marginBottom: '4px' }} />
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: '2px' }}>Physical Computing</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Connecting sensors, motors, and microcontrollers.
                </p>
              </div>
            </div>

            <Link to="/programs#ai-coding-robotics" className="btn btn-primary">
              <span>Explore Robotics Modules</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Interactive Feature Terminal Graphic */}
          <div>
            <div 
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Terminal Window Header */}
              <div 
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '12px', fontFamily: 'monospace' }}>
                  mindsparq_robotics_core.py
                </span>
              </div>

              {/* Code Snippet Box */}
              <div 
                style={{
                  padding: 'var(--space-6)',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: 'var(--text-xs)',
                  lineHeight: 1.7,
                  color: 'var(--color-text-primary)',
                  overflowX: 'auto'
                }}
              >
                <div><span style={{ color: 'var(--color-brand-primary)' }}>class</span> <span style={{ color: 'var(--color-accent-teal)' }}>SmartRover</span>:</div>
                <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--color-text-muted)' }}># Initialize ultrasonic & line detection sensors</span></div>
                <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--color-brand-primary)' }}>def</span> <span style={{ color: 'var(--color-amber-highlight)' }}>__init__</span>(self, pins):</div>
                <div style={{ paddingLeft: '32px' }}>self.sensor_data = SensorStream(pins)</div>
                <div style={{ paddingLeft: '32px' }}>self.motor_driver = MotorController()</div>
                <br />
                <div style={{ paddingLeft: '16px' }}><span style={{ color: 'var(--color-brand-primary)' }}>def</span> <span style={{ color: 'var(--color-amber-highlight)' }}>navigate_maze</span>(self):</div>
                <div style={{ paddingLeft: '32px' }}>distance = self.sensor_data.read_cm()</div>
                <div style={{ paddingLeft: '32px' }}><span style={{ color: 'var(--color-brand-primary)' }}>if</span> distance &lt; <span style={{ color: '#F4B544' }}>15</span>:</div>
                <div style={{ paddingLeft: '48px' }}>self.motor_driver.pivot_turn(<span style={{ color: '#F4B544' }}>90</span>)</div>
                <div style={{ paddingLeft: '32px' }}><span style={{ color: 'var(--color-brand-primary)' }}>else</span>:</div>
                <div style={{ paddingLeft: '48px' }}>self.motor_driver.drive_forward(speed=<span style={{ color: '#F4B544' }}>80</span>)</div>
              </div>

              <div 
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)'
                }}
              >
                <Sparkles size={13} style={{ color: 'var(--color-accent-teal)' }} />
                <span>Hands-on experimentation with real algorithms & hardware logic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .feature-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

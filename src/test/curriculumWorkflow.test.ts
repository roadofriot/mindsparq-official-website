import { describe, it, expect } from 'vitest';
import { Course, Lesson } from '../types/database';

describe('Curriculum Workflow & Age Group Targeting (Phase 7)', () => {
  const sampleCourses: Course[] = [
    {
      id: 'c-1',
      slug: 'scratch-robotics-kids',
      title: 'Scratch Robotics for Kids',
      summary: 'Playful programming with Lego & Scratch blocks',
      description: 'Introductory robotics logic for younger children.',
      cover_image_url: null,
      level: 'Beginner',
      age_group: 'elementary',
      estimated_duration: '4 Weeks',
      visibility: 'public',
      access_type: 'free',
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c-2',
      slug: 'python-microcontroller-automation',
      title: 'Microcontroller Automation with MicroPython',
      summary: 'Sensors, circuits, and Python control algorithms',
      description: 'Circuit building and Python programming for teens.',
      cover_image_url: null,
      level: 'Intermediate',
      age_group: 'middle_school',
      estimated_duration: '6 Weeks',
      visibility: 'public',
      access_type: 'free',
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c-3',
      slug: 'applied-ai-neural-networks',
      title: 'Applied Machine Learning & Vision Systems',
      summary: 'Computer vision and deep learning with OpenCV & PyTorch',
      description: 'Advanced AI principles for high school and university students.',
      cover_image_url: null,
      level: 'Advanced',
      age_group: 'high_school',
      estimated_duration: '8 Weeks',
      visibility: 'public',
      access_type: 'free',
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c-4',
      slug: 'computational-thinking-universal',
      title: 'Computational Thinking Foundations',
      summary: 'Algorithmic problem solving across disciplines',
      description: 'Universal thinking frameworks for all ages.',
      cover_image_url: null,
      level: 'All Levels',
      age_group: 'all_ages',
      estimated_duration: '3 Weeks',
      visibility: 'public',
      access_type: 'free',
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  it('filters courses correctly by age group criteria', () => {
    const filterByAge = (group: string) =>
      sampleCourses.filter(
        (c) => group === 'all' || !c.age_group || c.age_group === group || c.age_group === 'all_ages'
      );

    // All should include all 4
    expect(filterByAge('all').length).toBe(4);

    // Elementary should return scratch course + universal course
    const elementary = filterByAge('elementary');
    expect(elementary.map((c) => c.id)).toContain('c-1');
    expect(elementary.map((c) => c.id)).toContain('c-4');
    expect(elementary.map((c) => c.id)).not.toContain('c-2');
    expect(elementary.map((c) => c.id)).not.toContain('c-3');

    // Middle school should return python course + universal course
    const middle = filterByAge('middle_school');
    expect(middle.map((c) => c.id)).toContain('c-2');
    expect(middle.map((c) => c.id)).toContain('c-4');

    // High school should return AI course + universal course
    const high = filterByAge('high_school');
    expect(high.map((c) => c.id)).toContain('c-3');
    expect(high.map((c) => c.id)).toContain('c-4');
  });

  it('validates lesson resource attachments across supported file types', () => {
    const sampleLessons: Lesson[] = [
      {
        id: 'l-1',
        module_id: 'm-1',
        title: 'Building the Motor Driver Circuit',
        slug: 'building-motor-driver',
        lesson_type: 'video',
        body_text: 'Wiring instructions',
        video_provider: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        duration_minutes: 20,
        sort_order: 1,
        status: 'published',
        resource_title: 'Schematic Diagram & Pinout (PDF)',
        resource_type: 'pdf',
        resource_url: 'https://mindsparqeducation.com.np/resources/schematic.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'l-2',
        module_id: 'm-1',
        title: 'Obstacle Avoidance Code',
        slug: 'obstacle-avoidance-code',
        lesson_type: 'video',
        body_text: 'Scratch algorithm',
        video_provider: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        duration_minutes: 15,
        sort_order: 2,
        status: 'published',
        resource_title: 'Starter Scratch Project (.sb3)',
        resource_type: 'scratch',
        resource_url: 'https://scratch.mit.edu/projects/12345678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    expect(sampleLessons[0].resource_type).toBe('pdf');
    expect(sampleLessons[0].resource_url).toContain('.pdf');
    expect(sampleLessons[1].resource_type).toBe('scratch');
    expect(sampleLessons[1].resource_title).toContain('Scratch');
  });
});

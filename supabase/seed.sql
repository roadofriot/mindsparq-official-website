-- MindSparQ Education & Technology Development Seed Data
-- Safe synthetic data for local/staging verification

-- 1. Programs (Matching exact verified curricula)
insert into public.programs (slug, title, summary, description, audience, icon_name, sort_order, status)
values
  (
    'abacus-mental-math',
    'Abacus & Mental Math',
    'Build strong numerical agility, sharp focus, and whole-brain calculation reflexes through proven bead manipulation.',
    'Our structured abacus program transforms how learners perceive numbers. By transitioning from physical tactile bead manipulation to high-speed visual imagery, students cultivate rapid mental arithmetic, sustained attention, and mathematical confidence.',
    'Ages 5-13',
    'Calculator',
    1,
    'published'
  ),
  (
    'vedic-mathematics',
    'Vedic Mathematics',
    'Discover ancient sixteen-sutra mathematical shortcuts that simplify complex calculations into intuitive steps.',
    'Designed for middle and high school students, Vedic Mathematics introduces elegant mental calculation sutras. It accelerates multi-digit multiplication, division, algebraic factoring, and square roots while eliminating math anxiety.',
    'Grade 6 & Above',
    'Brain',
    2,
    'published'
  ),
  (
    'ai-coding-robotics',
    'AI Coding & Robotics',
    'Empower young innovators with hands-on computational thinking, sensor mechanics, and block-to-text Python logic.',
    'A project-driven curriculum where students build real physical robotic mechanisms and program smart behaviors. Covering visual coding foundations, electronics, microcontrollers, and modern machine learning concepts.',
    'Ages 7-16',
    'Cpu',
    3,
    'published'
  ),
  (
    'handwriting-development',
    'Handwriting Development',
    'Develop neat, legible, and effortless English and Nepali script through biomechanically sound stroke practice.',
    'Good handwriting builds cognitive retention and academic confidence. We guide students through correct pencil grasp, posture, baseline alignment, and fluid stroke dynamics in both English print/cursive and Nepali Devanagari.',
    'All Ages',
    'PenTool',
    4,
    'published'
  ),
  (
    'ai-literacy-training',
    'AI Literacy & Training',
    'Practical, ethical, and empowering artificial intelligence orientation for students, educators, and working professionals.',
    'Understand how modern generative models, computer vision, and neural systems operate. We teach prompt engineering, critical source verification, ethical AI principles, and workflow automation tailored for education and productivity.',
    'Students, Teachers & Parents',
    'Sparkles',
    5,
    'published'
  ),
  (
    'school-teacher-support',
    'School & Teacher Support',
    'Custom institutional training, STEM lab integration, and collaborative workshop modules for educational institutions.',
    'Partnering with schools across Nepal to establish progressive robotics labs, train teachers in experiential pedagogical frameworks, and organize regional computational competitions.',
    'Schools & Educators',
    'GraduationCap',
    6,
    'published'
  )
on conflict (slug) do nothing;

-- 2. Carousel Items
insert into public.carousel_items (title, subtitle, image_url, alt_text, cta_label, cta_url, sort_order, status)
values
  (
    'Empowering Minds, Sparking Innovation',
    'Next-generation cognitive skill development, robotics, and applied AI education in Nepal.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    'Students collaborating on robotics and technology learning',
    'Explore Programs',
    '/programs',
    1,
    'published'
  ),
  (
    'Hands-on AI & Robotics Lab',
    'From visual programming to physical sensors and microcontrollers for young innovators.',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    'Robotics hardware kit with sensors and microcontrollers',
    'View Course Catalog',
    '/courses',
    2,
    'published'
  )
on conflict do nothing;

-- 3. Social Links
insert into public.social_links (platform, profile_url, display_label, is_enabled, sort_order)
values
  ('facebook', 'https://facebook.com/mindsparqeducation', 'Facebook', true, 1),
  ('instagram', 'https://instagram.com/mindsparqeducation', 'Instagram', true, 2),
  ('tiktok', 'https://tiktok.com/@mindsparqeducation', 'TikTok', true, 3),
  ('youtube', 'https://youtube.com/@mindsparqeducation', 'YouTube', true, 4)
on conflict do nothing;

-- 4. Sample Free Course
insert into public.courses (id, slug, title, summary, description, level, estimated_duration, visibility, access_type, status, published_at)
values
  (
    'c0000000-0000-0000-0000-000000000001',
    'foundations-of-robotics-and-computational-thinking',
    'Foundations of Robotics & Computational Thinking',
    'A beginner-friendly practical introduction to the fundamental logic behind sensors, algorithms, and interactive hardware.',
    'This free foundational course introduces learners to the core concepts of computational thinking, mechanical structures, and autonomous feedback loops. Students will learn how inputs convert to programmatic actions without requiring expensive hardware upfront.',
    'Beginner',
    '4 Weeks (Self-paced)',
    'public',
    'free',
    'published',
    now()
  )
on conflict (slug) do nothing;

-- Course Modules & Lessons for the sample course
insert into public.course_modules (id, course_id, title, description, sort_order, status)
values
  (
    'm0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Module 1: The Anatomy of a Robot',
    'Explore what makes a machine a robot and understand the loop of Sense, Think, Act.',
    1,
    'published'
  ),
  (
    'm0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'Module 2: Sensors and Environmental Feedback',
    'Learn how ultrasonic, infrared, and tactile sensors perceive physical reality.',
    2,
    'published'
  )
on conflict do nothing;

insert into public.lessons (id, module_id, title, slug, lesson_type, body_text, video_provider, video_id, duration_minutes, sort_order, status)
values
  (
    'l0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000001',
    'Welcome & What is a Robot?',
    'welcome-what-is-a-robot',
    'video',
    'In this opening lesson, we demystify robotics. A robot is an electro-mechanical device capable of reacting to its environment based on programmed rules.\n\nKey Concepts:\n- Sensors (Input)\n- Microcontroller (Processing)\n- Actuators and Motors (Output)',
    'youtube',
    'dQw4w9WgXcQ',
    10,
    1,
    'published'
  ),
  (
    'l0000000-0000-0000-0000-000000000002',
    'm0000000-0000-0000-0000-000000000001',
    'The Sense-Think-Act Cycle',
    'sense-think-act-cycle',
    'article',
    'Every autonomous system follows a recursive control loop known as Sense-Think-Act.\n\n1. SENSE: Gather data from surroundings (e.g. distance to wall).\n2. THINK: Compare against programmed threshold (e.g. if distance < 15cm).\n3. ACT: Trigger motor commands (e.g. reverse motors and turn left).\n\nBy chaining these simple instructions, machines achieve complex, reliable behaviors.',
    null,
    null,
    15,
    2,
    'published'
  )
on conflict do nothing;

-- 5. Sample Events
insert into public.events (slug, title, summary, description, location_text, starts_at, ends_at, registration_url, status)
values
  (
    'annual-stem-innovation-exhibition',
    'Annual STEM & Robotics Exhibition 2026',
    'A showcase of student-engineered robotics prototypes, mental arithmetic demonstrations, and innovative creations.',
    'Join MindSparQ Education & Technology for our flagship exhibition in Butwal. Students from our robotics, abacus, and AI literacy cohorts will present live demonstrations of autonomous rovers, speed calculation challenges, and software projects.',
    'Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal',
    timezone('utc'::text, now() + interval '14 days'),
    timezone('utc'::text, now() + interval '14 days 4 hours'),
    'https://mindsparqeducation.com.np/contact',
    'published'
  )
on conflict (slug) do nothing;

-- 6. Sample Blog Post
insert into public.blog_posts (slug, title, excerpt, content, category, author_name, status, published_at)
values
  (
    'why-abacus-training-enhances-mathematical-fluency',
    'Why Abacus Training Enhances Mathematical Fluency in Early Childhood',
    'Discover how tactile bead calculation transitions into spatial mental arithmetic, fostering concentration and numerical confidence.',
    'In an era dominated by screens and automated calculators, tactile calculation through the soroban abacus remains one of the most effective methods to develop cognitive number sense.\n\n### The Dual-Hemisphere Connection\nWhen children move beads with both hands, both the left (logical, sequential) and right (spatial, intuitive) hemispheres of the brain are engaged simultaneously.\n\n### Transition to Anzan (Mental Calculation)\nOnce the physical bead mechanics become intuitive, learners visualize the abacus in their mind’s eye. This mental projection allows children to perform multi-digit addition and multiplication faster than typing into a conventional keypad.\n\nAt MindSparQ, our structured curriculum ensures learners progress safely from foundational finger dexterity to lifelong mathematical fluency.',
    'Cognitive Skills',
    'MindSparQ Academic Team',
    'published',
    now()
  )
on conflict (slug) do nothing;

export type RoleKey = 'super_admin' | 'owner' | 'admin' | 'editor' | 'designer' | 'seo_manager' | 'contributor' | 'learner';

export interface CmsDocument<T = Record<string, unknown>> {
  key: string;
  data: T;
  version: number;
  published_at: string;
  published_by?: string | null;
  published_by_name?: string | null;
}

export interface CmsDraft<T = Record<string, unknown>> {
  key: string;
  data: T;
  base_version: number;
  updated_at: string;
  updated_by?: string | null;
  updated_by_name?: string | null;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_path: string | null;
  bio: string | null;
  status?: 'active' | 'invited' | 'suspended' | 'deactivated';
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_key: RoleKey;
  granted_by: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  storage_path: string;
  original_filename: string;
  alt_text: string;
  caption: string | null;
  media_type: 'image' | 'document' | 'audio';
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  uploaded_by: string;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  alt_text: string;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  starts_at: string | null;
  ends_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string | null;
  icon_name: string | null;
  cover_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_image_url: string | null;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  age_group?: 'elementary' | 'middle_school' | 'high_school' | 'all_ages' | null;
  estimated_duration: string | null;
  visibility: 'public' | 'unlisted' | 'private';
  access_type: 'free' | 'invite_only';
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  lesson_type: 'article' | 'video' | 'resource';
  body_text: string | null;
  video_provider: 'youtube' | 'vimeo' | null;
  video_id: string | null;
  duration_minutes: number | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  resource_url?: string | null;
  resource_title?: string | null;
  resource_type?: 'pdf' | 'scratch' | 'code' | 'worksheet' | 'link' | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'revoked';
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  last_position_seconds: number;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_id?: string | null;
  author_name: string;
  category: string;
  status: 'draft' | 'review' | 'in_review' | 'approved' | 'published' | 'archived';
  published_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  author_profile_id?: string | null;
  review_feedback?: string | null;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
}

export interface ContentLike {
  id: string;
  user_id: string;
  target_type: 'blog_post' | 'course';
  target_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  target_type: 'blog_post' | 'course';
  target_id: string;
  created_at: string;
  target_details?: BlogPost | Course;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_image_url: string | null;
  location_text: string;
  starts_at: string;
  ends_at: string | null;
  registration_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  profile_url: string;
  display_label: string;
  is_enabled: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content_json: Record<string, unknown>;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContentVersion {
  id: string;
  content_type: 'blog_post' | 'course' | 'program' | 'site_section' | 'section' | 'page' | 'header' | 'footer' | 'theme';
  content_id: string;
  version_number: number;
  title: string;
  snapshot: Record<string, unknown>;
  change_summary?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
  created_at: string;
  restored_at?: string | null;
}

export type TeamCategory = 'leadership' | 'teaching' | 'program_leads' | 'operations' | 'advisory';
export type TeamReviewStatus = 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'published' | 'unpublished';

export interface TeamSocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export interface TeamProfile {
  id: string;
  user_id: string | null;
  slug: string;
  display_name: string;
  display_name_nepali: string | null;
  public_title: string;
  public_title_nepali: string | null;
  team_category: TeamCategory;
  short_bio: string;
  bio: string;
  profile_image_path: string | null;
  education: string | null;
  qualifications: string[] | null;
  teaching_subjects: string[] | null;
  responsibilities: string[] | null;
  social_links: TeamSocialLinks;
  is_featured_founder: boolean;
  is_public: boolean;
  review_status: TeamReviewStatus;
  review_notes: string | null;
  sort_order: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  published_at: string | null;
  published_by: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}



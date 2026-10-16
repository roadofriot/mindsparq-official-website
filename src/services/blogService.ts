import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BlogPost, BlogComment, Bookmark } from '../types/database';
import { recordAuditLog } from './auditService';

// ==========================================
// BLOG POSTS
// ==========================================

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Blog] Error fetching published posts:', error);
    return [];
  }

  // Filter future published_at client-side as well
  return ((data as BlogPost[]) || []).filter((post) => {
    return !post.published_at || post.published_at <= now;
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as BlogPost;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as BlogPost;
}

export async function getDraftOrPublishedPost(idOrSlug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null;

  // Try by ID first
  const byId = await getPostById(idOrSlug);
  if (byId) return byId;

  // Try by Slug
  return await getPostBySlug(idOrSlug);
}


export async function getAllPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Blog] Error fetching all posts:', error);
    return [];
  }

  return (data as BlogPost[]) || [];
}

export async function savePost(
  post: Partial<BlogPost>
): Promise<{ data: BlogPost | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isNew = !post.id;
  const payload: Record<string, unknown> = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url || null,
    author_id: post.author_id || user?.id || null,
    author_name: post.author_name || 'MindSparQ Team',
    category: post.category || 'Education',
    status: post.status || 'draft',
    seo_title: post.seo_title || null,
    seo_description: post.seo_description || null,
    updated_by: user?.id || null,
    updated_at: new Date().toISOString()
  };

  if (post.status === 'published') {
    payload.published_at = post.published_at || new Date().toISOString();
  }

  if (isNew) {
    payload.created_by = user?.id || null;
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('blog.create', 'blog_posts', data.id, { title: data.title, status: data.status });
    }
    return { data: data as BlogPost, error };
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', post.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('blog.update', 'blog_posts', data.id, { title: data.title, status: data.status });
    }
    return { data: data as BlogPost, error };
  }
}

export async function updatePostStatus(
  id: string,
  newStatus: 'draft' | 'review' | 'published' | 'archived'
): Promise<{ data: BlogPost | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_by: user?.id || null,
    updated_at: new Date().toISOString()
  };

  if (newStatus === 'published') {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (!error && data) {
    const actionKey =
      newStatus === 'published'
        ? 'blog.publish'
        : newStatus === 'archived'
        ? 'blog.archive'
        : newStatus === 'review'
        ? 'blog.submit_review'
        : 'blog.unpublish';

    await recordAuditLog(actionKey, 'blog_posts', id, { newStatus, title: data.title });
  }

  return { data: data as BlogPost, error };
}

export async function deletePost(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (!error) {
    await recordAuditLog('blog.delete', 'blog_posts', id);
  }
  return { error };
}

// ==========================================
// COMMENTS & MODERATION
// ==========================================

export async function getCommentsForPost(postId: string): Promise<BlogComment[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[MindSparQ Blog] Error fetching comments:', error.message);
    return [];
  }

  return (data as BlogComment[]) || [];
}

export async function getAllComments(statusFilter?: string): Promise<BlogComment[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('blog_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[MindSparQ Blog] Error fetching moderation queue:', error);
    return [];
  }

  return (data as BlogComment[]) || [];
}

export async function submitComment(
  postId: string,
  authorName: string,
  body: string
): Promise<{ data: BlogComment | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('Please sign in to submit a comment.') };
  }

  if (body.trim().length < 2) {
    return { data: null, error: new Error('Comment must be at least 2 characters.') };
  }

  if (body.trim().length > 2000) {
    return { data: null, error: new Error('Comment exceeds maximum length of 2000 characters.') };
  }

  const { data, error } = await supabase
    .from('blog_comments')
    .insert([
      {
        post_id: postId,
        user_id: user.id,
        author_name: authorName.trim() || 'Learner',
        body: body.trim(),
        status: 'pending' // Always pending first for safe moderation
      }
    ])
    .select()
    .single();

  return { data: data as BlogComment, error };
}

export async function moderateComment(
  commentId: string,
  status: 'approved' | 'rejected' | 'spam'
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase
    .from('blog_comments')
    .update({ status })
    .eq('id', commentId);

  if (!error) {
    await recordAuditLog('comment.moderate', 'blog_comments', commentId, { status });
  }

  return { error };
}

export async function deleteComment(commentId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
  return { error };
}

// ==========================================
// LIKES & BOOKMARKS
// ==========================================

export async function getPostLikeInfo(postId: string): Promise<{ count: number; isLiked: boolean }> {
  if (!isSupabaseConfigured) return { count: 0, isLiked: false };

  const { count } = await supabase
    .from('content_likes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', 'blog_post')
    .eq('target_id', postId);

  const { data: { user } } = await supabase.auth.getUser();
  let isLiked = false;

  if (user) {
    const { data } = await supabase
      .from('content_likes')
      .select('id')
      .eq('target_type', 'blog_post')
      .eq('target_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    isLiked = Boolean(data);
  }

  return { count: count || 0, isLiked };
}

export async function toggleLike(
  targetType: 'blog_post' | 'course',
  targetId: string
): Promise<{ isLiked: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { isLiked: false, error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { isLiked: false, error: new Error('Sign in required to like content.') };
  }

  // Check if currently liked
  const { data: existing } = await supabase
    .from('content_likes')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('content_likes')
      .delete()
      .eq('id', existing.id);
    return { isLiked: false, error };
  } else {
    const { error } = await supabase
      .from('content_likes')
      .insert([
        {
          target_type: targetType,
          target_id: targetId,
          user_id: user.id
        }
      ]);
    return { isLiked: true, error };
  }
}

export async function getBookmarkStatus(
  targetType: 'blog_post' | 'course',
  targetId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('user_id', user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function toggleBookmark(
  targetType: 'blog_post' | 'course',
  targetId: string
): Promise<{ isBookmarked: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { isBookmarked: false, error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { isBookmarked: false, error: new Error('Sign in required to bookmark.') };
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
    return { isBookmarked: false, error };
  } else {
    const { error } = await supabase.from('bookmarks').insert([
      {
        target_type: targetType,
        target_id: targetId,
        user_id: user.id
      }
    ]);
    return { isBookmarked: true, error };
  }
}

export async function getUserBookmarks(): Promise<Bookmark[]> {
  if (!isSupabaseConfigured) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Blog] Error fetching bookmarks:', error);
    return [];
  }

  return (data as Bookmark[]) || [];
}

export interface EnrichedBookmark {
  bookmark: Bookmark;
  title: string;
  slug: string;
  categoryOrLevel: string;
  url: string;
  summary?: string;
}

export async function getEnrichedUserBookmarks(): Promise<EnrichedBookmark[]> {
  const bookmarks = await getUserBookmarks();
  if (!bookmarks || bookmarks.length === 0) return [];

  const postIds = bookmarks.filter((b) => b.target_type === 'blog_post').map((b) => b.target_id);
  const courseIds = bookmarks.filter((b) => b.target_type === 'course').map((b) => b.target_id);

  const postsMap = new Map<string, { title: string; slug: string; category?: string; summary?: string }>();
  const coursesMap = new Map<string, { title: string; slug: string; level?: string; summary?: string }>();

  if (postIds.length > 0 && isSupabaseConfigured) {
    try {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, summary')
        .in('id', postIds);
      if (posts) {
        posts.forEach((p) => postsMap.set(p.id, p));
      }
    } catch (e) {
      console.warn('[MindSparQ Blog] Could not enrich blog bookmarks:', e);
    }
  }

  if (courseIds.length > 0 && isSupabaseConfigured) {
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, slug, level, summary')
        .in('id', courseIds);
      if (courses) {
        courses.forEach((c) => coursesMap.set(c.id, c));
      }
    } catch (e) {
      console.warn('[MindSparQ Blog] Could not enrich course bookmarks:', e);
    }
  }

  return bookmarks.map((b) => {
    if (b.target_type === 'blog_post') {
      const p = postsMap.get(b.target_id);
      return {
        bookmark: b,
        title: p?.title || 'Saved Blog Article',
        slug: p?.slug || '',
        categoryOrLevel: p?.category || 'Article',
        url: p?.slug ? `/blog/${p.slug}` : '/blog',
        summary: p?.summary
      };
    } else {
      const c = coursesMap.get(b.target_id);
      return {
        bookmark: b,
        title: c?.title || 'Saved Course',
        slug: c?.slug || '',
        categoryOrLevel: c?.level || 'Course',
        url: c?.slug ? `/courses/${c.slug}` : '/courses',
        summary: c?.summary
      };
    }
  });
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllCourses,
  saveCourse,
  deleteCourse,
  getCourseModulesWithLessons,
  saveCourseModule,
  deleteCourseModule,
  saveLesson,
  deleteLesson,
  extractYouTubeVideoId
} from '../../services/courseService';
import { createContentVersion } from '../../services/versionService';
import { Course, CourseModule, Lesson } from '../../types/database';
import { Plus, Edit2, Trash2, BookOpen, Video, FileText, ChevronRight, AlertCircle, ArrowLeft, Eye } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';


export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Active course builder mode
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);

  // Lesson Modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    getAllCourses()
      .then((data) => setCourses(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    const mods = await getCourseModulesWithLessons(course.id);
    setModules(mods);
  };

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse({ ...course });
    } else {
      setEditingCourse({
        slug: '',
        title: '',
        summary: '',
        description: '',
        cover_image_url: '',
        level: 'Beginner',
        estimated_duration: '4 Weeks',
        visibility: 'public',
        access_type: 'free',
        status: 'draft'
      });
    }
    setCourseError(null);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (!editingCourse.slug || !/^[a-z0-9-]+$/.test(editingCourse.slug)) {
      setCourseError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }
    if (!editingCourse.title?.trim()) {
      setCourseError('Title is required.');
      return;
    }

    setSavingCourse(true);
    setCourseError(null);
    const { data, error } = await saveCourse(editingCourse);

    if (error) {
      setCourseError(error.message);
    } else if (data) {
      await createContentVersion(
        'course',
        data.id,
        data.title,
        data as unknown as Record<string, unknown>,
        `Course saved in ${data.status} status`
      );
      setIsCourseModalOpen(false);
      fetchCourses();
      if (selectedCourse?.id === data.id) {
        setSelectedCourse(data);
      }
    }
    setSavingCourse(false);
  };


  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}" and all its modules/lessons?`)) return;
    const { error } = await deleteCourse(id);
    if (!error) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  // Module creation
  const handleAddModule = async () => {
    if (!selectedCourse) return;
    const title = window.prompt('Enter Module Title:');
    if (!title || !title.trim()) return;

    const { data, error } = await saveCourseModule({
      course_id: selectedCourse.id,
      title: title.trim(),
      sort_order: modules.length + 1,
      status: 'published'
    });

    if (error) {
      alert('Module error: ' + error.message);
    } else if (data) {
      const refreshed = await getCourseModulesWithLessons(selectedCourse.id);
      setModules(refreshed);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCourse) return;
    if (!window.confirm('Delete this module and all contained lessons?')) return;
    const { error } = await deleteCourseModule(moduleId);
    if (!error) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    }
  };

  // Lesson creation & editing
  const handleOpenAddLesson = (moduleId: string) => {
    setEditingLesson({
      module_id: moduleId,
      title: '',
      slug: '',
      lesson_type: 'video',
      video_id: '',
      duration_minutes: 10,
      body_text: '',
      sort_order: 1,
      status: 'published'
    });
    setLessonError(null);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !selectedCourse) return;

    if (!editingLesson.title?.trim()) {
      setLessonError('Lesson title is required.');
      return;
    }
    if (!editingLesson.slug || !/^[a-z0-9-]+$/.test(editingLesson.slug)) {
      setLessonError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }
    if (editingLesson.lesson_type === 'video') {
      const vidId = extractYouTubeVideoId(editingLesson.video_id);
      if (!vidId) {
        setLessonError('Please provide a valid YouTube video URL or 11-character video ID.');
        return;
      }
      editingLesson.video_id = vidId;
    }

    setSavingLesson(true);
    setLessonError(null);
    const { data, error } = await saveLesson(editingLesson);

    if (error) {
      setLessonError(error.message);
    } else if (data) {
      setIsLessonModalOpen(false);
      const refreshed = await getCourseModulesWithLessons(selectedCourse.id);
      setModules(refreshed);
    }
    setSavingLesson(false);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourse) return;
    if (!window.confirm('Delete this lesson?')) return;
    const { error } = await deleteLesson(lessonId);
    if (!error) {
      const refreshed = await getCourseModulesWithLessons(selectedCourse.id);
      setModules(refreshed);
    }
  };

  return (
    <div>
      {/* If inside a selected course builder */}
      {selectedCourse ? (
        <div>
          <button
            onClick={() => setSelectedCourse(null)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}
          >
            <ArrowLeft size={16} /> Back to Course Catalog
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                Course Builder
              </span>
              <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                {selectedCourse.title}
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)' }}>
                /{selectedCourse.slug} • {selectedCourse.level} • {selectedCourse.status}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={() => handleOpenCourseModal(selectedCourse)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <Edit2 size={16} /> Edit Details
              </button>
              <button
                onClick={handleAddModule}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <Plus size={16} /> Add Module
              </button>
            </div>
          </div>

          {/* Modules Accordion Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {modules.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
                <BookOpen size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  This course has no modules yet. Click "Add Module" to start structuring the syllabus.
                </p>
                <button onClick={handleAddModule} className="btn btn-primary">
                  Add First Module
                </button>
              </div>
            ) : (
              modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="card"
                  style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: 'var(--space-4) var(--space-6)',
                      backgroundColor: 'var(--color-surface-hover)',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                        Module {modIdx + 1}
                      </span>
                      <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)', margin: '2px 0 0' }}>
                        {mod.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => handleOpenAddLesson(mod.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Lessons in Module */}
                  <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    {!mod.lessons || mod.lessons.length === 0 ? (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        No lessons in this module yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {mod.lessons.map((less, lIdx) => (
                          <div
                            key={less.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                {lIdx + 1}.
                              </span>
                              {less.lesson_type === 'video' ? (
                                <Video size={16} color="var(--color-primary-600)" />
                              ) : (
                                <FileText size={16} color="var(--color-text-secondary)" />
                              )}
                              <div>
                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                                  {less.title}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                                  /{less.slug} {less.duration_minutes ? `• ${less.duration_minutes}m` : ''}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteLesson(less.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Course Catalog Overview in Admin */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                Course Management
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
                Create structured learning modules, video lessons, and manage free enrollment access.
              </p>
            </div>

            <button
              onClick={() => handleOpenCourseModal()}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Plus size={16} /> Create Course
            </button>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <BookOpen size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  No courses published yet. Click "Create Course" to get started.
                </p>
                <button onClick={() => handleOpenCourseModal()} className="btn btn-secondary">
                  Create First Course
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: 'var(--space-3)' }}>Course Title & Slug</th>
                    <th style={{ padding: 'var(--space-3)' }}>Level & Duration</th>
                    <th style={{ padding: 'var(--space-3)' }}>Access Type</th>
                    <th style={{ padding: 'var(--space-3)' }}>Status</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{c.title}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>/{c.slug}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                        {c.level} • {c.estimated_duration || 'Self-paced'}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-xs)',
                            fontWeight: 600,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981'
                          }}
                        >
                          {c.access_type}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-xs)',
                            fontWeight: 600,
                            backgroundColor:
                              c.status === 'published'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(245, 158, 11, 0.1)',
                            color: c.status === 'published' ? '#10b981' : '#d97706',
                            textTransform: 'capitalize'
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <Link
                            to={`/preview?type=course&id=${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Device Frame Live Preview (Desktop, Tablet, Mobile)"
                            style={{
                              padding: '4px 8px',
                              fontSize: 'var(--font-xs)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              borderRadius: 'var(--radius-sm)',
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </Link>
                          <button
                            onClick={() => handleSelectCourse(c)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          >
                            <span>Curriculum</span>
                            <ChevronRight size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenCourseModal(c)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '4px' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {isCourseModalOpen && editingCourse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              {editingCourse.id ? 'Edit Course Details' : 'Create New Course'}
            </h2>

            {courseError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <AlertCircle size={16} /> {courseError}
              </div>
            )}

            <form onSubmit={handleSaveCourse}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCourse.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = !editingCourse.id
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                        : editingCourse.slug;
                      setEditingCourse({ ...editingCourse, title, slug });
                    }}
                    placeholder="e.g. Introduction to Robotics"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCourse.slug || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                    placeholder="e.g. intro-robotics"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <ImageUploadField
                label="Course Cover Image (Catalog Thumbnail)"
                value={editingCourse.cover_image_url || ''}
                onChange={(url) => setEditingCourse({ ...editingCourse, cover_image_url: url })}
                altTextDefault={editingCourse.title || 'Course Thumbnail'}
                placeholder="Or paste external course thumbnail URL (https://...)..."
                recommendedDimensions="1200 × 675 px (16:9 widescreen card)"
                helperText="Optimal 16:9 aspect ratio. Displays on course cards, search results, and curriculum detail headers."
              />

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingCourse.summary || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, summary: e.target.value })}
                  placeholder="Short introductory summary for catalog cards..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="Detailed course description, learning outcomes, and prerequisites..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Level
                  </label>
                  <select
                    value={editingCourse.level || 'Beginner'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as any })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={editingCourse.estimated_duration || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, estimated_duration: e.target.value })}
                    placeholder="e.g. 4 Weeks"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingCourse.status || 'draft'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as any })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="btn btn-primary"
                >
                  {savingCourse ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Add/Edit Modal */}
      {isLessonModalOpen && editingLesson && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              Add Lesson to Module
            </h2>

            {lessonError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <AlertCircle size={16} /> {lessonError}
              </div>
            )}

            <form onSubmit={handleSaveLesson}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingLesson.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = !editingLesson.id
                      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                      : editingLesson.slug;
                    setEditingLesson({ ...editingLesson, title, slug });
                  }}
                  placeholder="e.g. What is a Microcontroller?"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={editingLesson.slug || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, slug: e.target.value })}
                  placeholder="e.g. what-is-microcontroller"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Lesson Format
                  </label>
                  <select
                    value={editingLesson.lesson_type || 'video'}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lesson_type: e.target.value as any })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="video">Video Lesson (YouTube)</option>
                    <option value="article">Reading Article</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={editingLesson.duration_minutes ?? 10}
                    onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {editingLesson.lesson_type === 'video' && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    YouTube Video URL or Video ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLesson.video_id || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, video_id: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>
                    Strict allowlist enforced: Only standard YouTube URLs/IDs are permitted.
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Lesson Body & Notes
                </label>
                <textarea
                  rows={4}
                  value={editingLesson.body_text || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, body_text: e.target.value })}
                  placeholder="Detailed notes, steps, and key concepts for this lesson..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="btn btn-primary"
                >
                  {savingLesson ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FlaskConical, Users, ClipboardList, ChevronRight, Lock, FileText, Eye, Maximize2, Minimize2, X } from 'lucide-react';
import { supabase, type Course, type Lab, type Profile, type Assignment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, EmptyState, SeverityBadge, difficultyToSeverity, InfoTip } from '@/components/ui';
import { formatDuration, formatDateTime } from '@/lib/format';
import { getCourseIcon } from '@/components/CourseIconPicker';

const typeBadge: Record<string, string> = { tp: 'badge-tp', devoir: 'badge-devoir', examen: 'badge-examen' };
const typeLabel: Record<string, string> = { tp: 'TP', devoir: 'DEVOIR', examen: 'EXAMEN' };

function CourseDocumentViewer({ course, fullscreen }: { course: Course; fullscreen?: boolean }) {
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoc() {
      if (!course.document_path) { setLoading(false); return; }
      const { data, error } = await supabase.storage
        .from('course-documents')
        .createSignedUrl(course.document_path, 3600);
      if (error) { setError('Impossible de charger le document'); setLoading(false); return; }
      setDocUrl(data.signedUrl);
      setLoading(false);
    }
    loadDoc();
  }, [course.document_path]);

  if (loading) return <p className="text-center text-cyber-text-muted py-4 text-sm">Chargement du document...</p>;
  if (error) return <p className="text-center text-[#ff3355] py-4 text-sm">{error}</p>;
  if (!docUrl) return null;

  const isPdf = course.document_name?.toLowerCase().endsWith('.pdf');
  const frameClass = fullscreen
    ? 'w-full flex-1 rounded-lg border border-cyber-border bg-cyber-surface'
    : 'w-full h-[600px] rounded-lg border border-cyber-border bg-cyber-surface';

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-cyber-text-dim min-w-0">
          <FileText className="w-4 h-4 text-[#00d4ff] flex-shrink-0" />
          <span className="truncate">{course.document_name}</span>
        </div>
        <span className="text-xs text-cyber-text-muted flex items-center gap-1.5 font-mono flex-shrink-0">
          <Lock className="w-3 h-3" /> LECTURE SEULE
        </span>
      </div>
      {isPdf ? (
        <iframe
          src={docUrl}
          title="Documentation du cours"
          className={frameClass}
          style={{ pointerEvents: 'auto' }}
        />
      ) : (
        <div className={frameClass + ' overflow-hidden'}>
          <object data={docUrl} type="application/octet-stream" className="w-full h-full">
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <Eye className="w-10 h-10 text-cyber-text-muted" />
              <p className="text-sm text-cyber-text-dim">Aperçu non disponible pour ce type de fichier.</p>
              <p className="text-xs text-cyber-text-muted">Le document est accessible en lecture seule via le lien sécurisé ci-dessous.</p>
            </div>
          </object>
        </div>
      )}
      <p className="text-xs text-cyber-text-muted mt-3 flex items-center gap-1.5">
        <Lock className="w-3 h-3" /> Ce document est en lecture seule. Le téléchargement n'est pas autorisé.
      </p>
    </>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id || !profile) return;
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
      setCourse(courseData as Course | null);

      const isStaff = profile.role === 'formateur' || profile.role === 'admin';

      if (profile.role === 'etudiant' && courseData) {
        const { data: enroll } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('course_id', id)
          .eq('student_id', profile.id)
          .maybeSingle();
        if (!enroll) {
          setNotEnrolled(true);
          setLoading(false);
          return;
        }
      }

      if (isStaff || profile.role === 'etudiant') {
        const [clRes, enrollRes, caRes] = await Promise.all([
          supabase.from('course_labs').select('lab:labs(*)').eq('course_id', id).order('sort_order', { ascending: true }),
          supabase.from('course_enrollments').select('student:profiles(*)').eq('course_id', id),
          supabase.from('course_assignments').select('assignment:assignments(*)').eq('course_id', id).order('sort_order', { ascending: true }),
        ]);
        setLabs(((clRes.data ?? []) as unknown as { lab: Lab }[]).map((r) => r.lab).filter(Boolean) as Lab[]);
        setStudents(((enrollRes.data ?? []) as unknown as { student: Profile }[]).map((r) => r.student).filter(Boolean) as Profile[]);
        setAssignments(((caRes.data ?? []) as unknown as { assignment: Assignment }[]).map((r) => r.assignment).filter(Boolean) as Assignment[]);
      }

      setLoading(false);
    }
    load();
  }, [id, profile]);

  const exitFullscreen = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') exitFullscreen();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, exitFullscreen]);

  if (loading) return <LoadingSpinner label="Chargement du cours..." />;
  if (!course) return <EmptyState icon={<BookOpen className="w-6 h-6 text-cyber-text-muted" />} title="Cours introuvable" />;

  if (notEnrolled) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => navigate('/courses')} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux cours
        </button>
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-[#ffaa00]/10 rounded-xl flex items-center justify-center border border-[#ffaa00]/20 mx-auto mb-4" style={{ boxShadow: '0 0 16px rgba(255, 170, 0, 0.08)' }}>
            <Lock className="w-7 h-7 text-[#ffaa00]" />
          </div>
          <h2 className="text-lg font-bold text-cyber-text mb-2">Accès restreint</h2>
          <p className="text-sm text-cyber-text-muted mb-4">
            Ce cours est public mais vous n'y êtes pas inscrit. Utilisez le code fourni par votre formateur pour vous inscrire.
          </p>
          <button onClick={() => navigate('/courses')} className="btn-primary text-sm">
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin';

  // Fullscreen overlay
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-cyber-bg flex flex-col animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-border bg-cyber-surface/90 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-[#39ff88]/10 rounded-lg flex items-center justify-center border border-[#39ff88]/20 flex-shrink-0">
              {(() => { const Icon = getCourseIcon(course.icon); return <Icon className="w-5 h-5 text-[#39ff88]" />; })()}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-cyber-text truncate">{course.title}</h1>
              <p className="text-xs text-cyber-text-muted font-mono truncate">
                {labs.length} LAB(S) — {assignments.length} TP/DEVOIR(S){course.code ? ` — CODE: ${course.code}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="btn-ghost text-sm flex-shrink-0"
            title="Quitter le plein écran (Échap)"
          >
            <Minimize2 className="w-4 h-4" /> Quitter plein écran
          </button>
        </div>

        {/* Fullscreen content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Course description */}
          {course.description && (
            <div className="card p-5 mb-5">
              <p className="text-sm text-cyber-text-muted leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Documentation */}
          {course.document_path && (
            <div className="card p-5 mb-5 flex flex-col" style={{ minHeight: '60vh' }}>
              <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2 mb-3 flex-shrink-0">
                <FileText className="w-5 h-5 text-[#00d4ff]" /> Documentation
              </h2>
              <div className="flex-1 flex flex-col">
                <CourseDocumentViewer course={course} fullscreen />
              </div>
            </div>
          )}

          {/* Labs + Assignments */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2 mb-3">
                <FlaskConical className="w-5 h-5 text-[#39ff88]" /> Laboratoires
              </h2>
              {labs.length === 0 ? (
                <EmptyState icon={<FlaskConical className="w-6 h-6 text-cyber-text-muted" />} title="Aucun lab" />
              ) : (
                <div className="space-y-2">
                  {labs.map((lab) => (
                    <Link key={lab.id} to={`/labs/${lab.id}`} onClick={() => setFullscreen(false)} className="card-hover p-4 flex items-center gap-3 group">
                      <div className="w-9 h-9 bg-[#39ff88]/10 rounded-lg flex items-center justify-center border border-[#39ff88]/20">
                        <FlaskConical className="w-4 h-4 text-[#39ff88]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-cyber-text group-hover:text-[#39ff88] transition-colors">{lab.title}</p>
                        <p className="text-xs text-cyber-text-muted font-mono">{lab.difficulty} — {formatDuration(lab.estimated_duration_min * 60)}</p>
                      </div>
                      <SeverityBadge level={difficultyToSeverity(lab.difficulty)} showIcon={false} />
                      <ChevronRight className="w-4 h-4 text-cyber-text-muted group-hover:text-[#39ff88] transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2 mb-3">
                <ClipboardList className="w-5 h-5 text-[#ffaa00]" /> TP & Devoirs
              </h2>
              {assignments.length === 0 ? (
                <EmptyState icon={<ClipboardList className="w-6 h-6 text-cyber-text-muted" />} title="Aucun TP ou devoir" />
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <Link key={a.id} to={`/assignments/${a.id}`} onClick={() => setFullscreen(false)} className="card-hover p-4 flex items-center gap-3 group">
                      <div className="w-9 h-9 bg-cyber-surface-hover rounded-lg flex items-center justify-center border border-cyber-border">
                        <ClipboardList className="w-4 h-4 text-cyber-text-dim" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-cyber-text group-hover:text-[#39ff88] transition-colors">{a.title}</p>
                          <span className={typeBadge[a.type]}>{typeLabel[a.type]}</span>
                        </div>
                        {a.due_date && <p className="text-xs text-cyber-text-muted mt-0.5 font-mono">À RENDRE: {formatDateTime(a.due_date)}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-cyber-text-muted group-hover:text-[#39ff88] transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/courses')} className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux cours
        </button>
        <button
          onClick={() => setFullscreen(true)}
          className="btn-secondary text-sm"
          title="Afficher en plein écran"
        >
          <Maximize2 className="w-4 h-4" /> Plein écran
        </button>
      </div>

      <div className="card p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#39ff88]/3 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 bg-[#39ff88]/10 rounded-xl flex items-center justify-center border border-[#39ff88]/20 flex-shrink-0" style={{ boxShadow: '0 0 20px rgba(57, 255, 136, 0.08)' }}>
            {(() => { const Icon = getCourseIcon(course.icon); return <Icon className="w-7 h-7 text-[#39ff88]" />; })()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-cyber-text mb-1">{course.title}</h1>
            <p className="text-sm text-cyber-text-muted mb-3">{course.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-cyber-text-muted font-mono">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students.length} ÉTUDIANT(S)</span>
              <span className="flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" />{labs.length} LAB(S)</span>
              <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{assignments.length} TP/DEVOIR(S)</span>
              {course.code && <span className="font-mono text-[#39ff88]">CODE: {course.code}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Documentation - full width */}
      {course.document_path && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00d4ff]" /> Documentation
            </h2>
            <button
              onClick={() => setFullscreen(true)}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="Plein écran"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Plein écran
            </button>
          </div>
          <CourseDocumentViewer course={course} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Labs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#39ff88]" /> Laboratoires du cours
            <InfoTip text="Les labs associés à ce cours. Chaque lab contient des flags à trouver pour gagner des points." />
          </h2>
          {labs.length === 0 ? (
            <EmptyState icon={<FlaskConical className="w-6 h-6 text-cyber-text-muted" />} title="Aucun lab" description="Les labs seront ajoutés par le formateur" />
          ) : (
            <div className="space-y-2">
              {labs.map((lab) => (
                <Link key={lab.id} to={`/labs/${lab.id}`} className="card-hover p-4 flex items-center gap-3 group">
                  <div className="w-9 h-9 bg-[#39ff88]/10 rounded-lg flex items-center justify-center border border-[#39ff88]/20">
                    <FlaskConical className="w-4 h-4 text-[#39ff88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cyber-text group-hover:text-[#39ff88] transition-colors">{lab.title}</p>
                    <p className="text-xs text-cyber-text-muted font-mono">{lab.difficulty} — {formatDuration(lab.estimated_duration_min * 60)}</p>
                  </div>
                  <SeverityBadge level={difficultyToSeverity(lab.difficulty)} showIcon={false} />
                  <ChevronRight className="w-4 h-4 text-cyber-text-muted group-hover:text-[#39ff88] transition-colors" />
                </Link>
              ))}
            </div>
          )}

          {/* Assignments */}
          <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2 mt-6">
            <ClipboardList className="w-5 h-5 text-[#ffaa00]" /> TP & Devoirs
            <InfoTip text="Travaux pratiques et devoirs associés à ce cours à compléter avant la date limite." />
          </h2>
          {assignments.length === 0 ? (
            <EmptyState icon={<ClipboardList className="w-6 h-6 text-cyber-text-muted" />} title="Aucun TP ou devoir" />
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <Link key={a.id} to={`/assignments/${a.id}`} className="card-hover p-4 flex items-center gap-3 group">
                  <div className="w-9 h-9 bg-cyber-surface-hover rounded-lg flex items-center justify-center border border-cyber-border">
                    <ClipboardList className="w-4 h-4 text-cyber-text-dim" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-cyber-text group-hover:text-[#39ff88] transition-colors">{a.title}</p>
                      <span className={typeBadge[a.type]}>{typeLabel[a.type]}</span>
                    </div>
                    {a.due_date && <p className="text-xs text-cyber-text-muted mt-0.5 font-mono">À RENDRE: {formatDateTime(a.due_date)}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyber-text-muted group-hover:text-[#39ff88] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Students (staff only) */}
        {isStaff && (
          <div>
            <h2 className="text-lg font-semibold text-cyber-text flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#00d4ff]" /> Étudiants inscrits
            </h2>
            {students.length === 0 ? (
              <EmptyState icon={<Users className="w-6 h-6 text-cyber-text-muted" />} title="Aucun étudiant" />
            ) : (
              <div className="card divide-y divide-cyber-border">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-cyber-surface-hover rounded-full flex items-center justify-center text-xs font-bold text-cyber-text-dim border border-cyber-border font-mono">
                      {student.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cyber-text truncate">{student.full_name}</p>
                      <p className="text-xs text-cyber-text-muted truncate font-mono">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

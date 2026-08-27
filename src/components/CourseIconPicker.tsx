import {
  Globe,
  Server,
  Network,
  ShieldCheck,
  Fingerprint,
  Lock,
  Bug,
  Terminal,
  Database,
  Key,
  Eye,
  Cpu,
  Wifi,
  Cloud,
  FileSearch,
  Crosshair,
  Zap,
  Activity,
  type LucideIcon,
} from 'lucide-react';

export interface CourseIcon {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const COURSE_ICONS: CourseIcon[] = [
  { key: 'globe', label: 'Web', Icon: Globe },
  { key: 'server', label: 'Système', Icon: Server },
  { key: 'network', label: 'Réseau', Icon: Network },
  { key: 'shield', label: 'Active Directory', Icon: ShieldCheck },
  { key: 'fingerprint', label: 'Forensics', Icon: Fingerprint },
  { key: 'lock', label: 'Cryptographie', Icon: Lock },
  { key: 'bug', label: 'Exploitation', Icon: Bug },
  { key: 'terminal', label: 'CLI / Shell', Icon: Terminal },
  { key: 'database', label: 'Base de données', Icon: Database },
  { key: 'key', label: 'Auth / Accès', Icon: Key },
  { key: 'eye', label: 'Surveillance', Icon: Eye },
  { key: 'cpu', label: 'Matériel', Icon: Cpu },
  { key: 'wifi', label: 'Sans-fil', Icon: Wifi },
  { key: 'cloud', label: 'Cloud', Icon: Cloud },
  { key: 'filesearch', label: 'Investigation', Icon: FileSearch },
  { key: 'crosshair', label: 'Pentest', Icon: Crosshair },
  { key: 'zap', label: 'Énergie', Icon: Zap },
  { key: 'activity', label: 'Monitoring', Icon: Activity },
];

const ICON_MAP = new Map(COURSE_ICONS.map((c) => [c.key, c.Icon]));

export function getCourseIcon(key: string | null | undefined): LucideIcon {
  if (key && ICON_MAP.has(key)) return ICON_MAP.get(key)!;
  return Globe;
}

interface CourseIconPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export default function CourseIconPicker({ value, onChange }: CourseIconPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-cyber-text-dim mb-1.5">Icône du cours</label>
      <p className="text-xs text-cyber-text-muted mb-3">Choisissez une icône représentant le domaine du cours</p>
      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-52 overflow-y-auto scrollbar-thin p-1">
        {COURSE_ICONS.map(({ key, label, Icon }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              title={label}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                selected
                  ? 'bg-[#39ff88]/10 border-[#39ff88]/30 text-[#39ff88]'
                  : 'bg-[#0a0e14] border-cyber-border text-cyber-text-muted hover:border-[#39ff88]/20 hover:text-cyber-text-dim'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-mono leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

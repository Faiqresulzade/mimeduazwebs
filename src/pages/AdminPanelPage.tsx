import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import type { WorkspaceTab } from '../components/workspace/TabBar';

const tabs: WorkspaceTab[] = [
  { to: '/admin/icmal', label: 'İcmal' },
  { to: '/admin/moderasiya', label: 'Moderasiya növbəsi' },
  { to: '/admin/sinaqlar', label: 'Sınaq moderasiyası' },
  { to: '/admin/telimler', label: 'Təlimlər' },
  { to: '/admin/istifadeciler', label: 'İstifadəçilər' },
  { to: '/admin/satis', label: 'Satış və komissiya' },
  { to: '/admin/sertifikatlar', label: 'Sertifikatlar' },
  { to: '/admin/loglar', label: 'Audit log' },
];

export default function AdminPanelPage() {
  return (
    <WorkspaceLayout
      title="Admin paneli"
      roleLabel="Administrator"
      tabs={tabs}
      crossLink={{ to: '/panel/telimlerim', label: 'Müəllim panelinə keç' }}
    />
  );
}

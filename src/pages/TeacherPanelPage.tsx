import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { useAuth } from '../hooks/useAuth';
import type { WorkspaceTab } from '../components/workspace/TabBar';

/** Şagird hesabı material satmır — müəllif bölmələri yalnız icazəsi olana göstərilir. */
const learnerTabs: WorkspaceTab[] = [
  { to: '/panel/telimlerim', label: 'Təlimlərim' },
  { to: '/panel/aldiqlarim', label: 'Aldıqlarım' },
  { to: '/panel/sertifikatlarim', label: 'Sertifikatlarım' },
];

const authorTabs: WorkspaceTab[] = [
  { to: '/panel/resurslarim', label: 'Resurslarım' },
  { to: '/panel/yukle', label: 'Yüklə' },
  { to: '/panel/imtahanlar', label: 'İmtahanlar' },
  { to: '/panel/sinaqlarim', label: 'Sınaqlarım' },
  { to: '/panel/ksq-yoxlama', label: 'KSQ yoxlama' },
  { to: '/panel/qazanc', label: 'Qazanc' },
];

export default function TeacherPanelPage() {
  const { canPublishResources } = useAuth();

  // "Yüklə" tabı şagirddə də qalır — orada "Müəllif ol" təklifi göstərilir.
  const tabs = canPublishResources
    ? [...learnerTabs, ...authorTabs]
    : [...learnerTabs, { to: '/panel/yukle', label: 'Müəllif ol' }];

  return (
    <WorkspaceLayout
      title={canPublishResources ? 'Müəllim paneli' : 'Panelim'}
      roleLabel={canPublishResources ? 'Müəllim · müəllif' : 'Şagird'}
      tabs={tabs}
    />
  );
}

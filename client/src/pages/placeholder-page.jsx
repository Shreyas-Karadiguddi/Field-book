import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';

export function PlaceholderPage({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState message="This screen is scaffolded and ready to build out." />
    </>
  );
}

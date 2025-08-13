import { type ReactNode, Suspense } from 'react';

interface Props {
  children: ReactNode;
  loadingComponent: ReactNode;
}

function FetchSuspense({ children, loadingComponent }: Props) {
  return <Suspense fallback={loadingComponent}>{children}</Suspense>;
}

export default FetchSuspense;

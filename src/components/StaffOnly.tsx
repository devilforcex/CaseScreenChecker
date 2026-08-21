import type { ReactNode } from 'react';

interface Props { isStaff: boolean; children: ReactNode; fallback?: ReactNode; }

/** Prevents privileged controls from rendering for signed-out/read-only users. RLS remains authoritative. */
export function StaffOnly({ isStaff, children, fallback = null }: Props) {
  return isStaff ? <>{children}</> : <>{fallback}</>;
}

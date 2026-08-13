"use client";

import { useSession } from "next-auth/react";
import React from "react";

interface PermissionGuardProps {
  requiredPermission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({
  requiredPermission,
  children,
}: PermissionGuardProps) {
  const { data: session } = useSession();
  const currentUser = session?.user as any;

  // Check if user has the required permission
  const hasPermission = currentUser?.userPermissions?.includes(
    requiredPermission
  );

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}

// hook to check if user has permission for a route or action
export function useHasPermission(requiredPermission: string) {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  return currentUser?.userPermissions?.includes(requiredPermission);
}

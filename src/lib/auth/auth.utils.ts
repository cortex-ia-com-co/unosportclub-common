const ROLES_NAMESPACE = 'https://unosportclub.com.co/roles';
const PERMISSIONS_NAMESPACE = 'https://unosportclub.com.co/permissions';
const USER_ID_NAMESPACE = 'https://unosportclub.com.co/user_id';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRoles(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  const roles = payload[ROLES_NAMESPACE];
  if (!Array.isArray(roles)) return [];
  return roles.filter((r): r is string => typeof r === 'string');
}

export function getPermissions(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  const permissions = payload[PERMISSIONS_NAMESPACE];
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p): p is string => typeof p === 'string');
}

export function hasRole(token: string, role: string): boolean {
  return getRoles(token).includes(role);
}

export function hasPermission(token: string, permission: string): boolean {
  return getPermissions(token).includes(permission);
}

export function getUserId(token: string): number | undefined {
  const payload = decodeJwtPayload(token);
  if (!payload) return undefined;
  const raw = payload[USER_ID_NAMESPACE];
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) ? n : undefined;
}

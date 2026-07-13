/**
 * Resolves the tenant (shop) ID for the logged-in user.
 *
 * The tenant ID is stamped into Supabase auth metadata at signup by the
 * `on_auth_user_created` database trigger, and Row Level Security scopes
 * every query to it. If it's missing the session predates that migration —
 * signing out and back in refreshes the token with the correct metadata.
 */
export function getActiveTenantId(user: { tenantId?: string } | null | undefined): string {
  if (user?.tenantId) return user.tenantId;
  throw new Error('No shop is linked to your session. Please sign out and sign back in.');
}

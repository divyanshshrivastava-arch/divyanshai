export function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '').trim()
  return token === (process.env.ADMIN_PASSWORD ?? 'divyansh')
}

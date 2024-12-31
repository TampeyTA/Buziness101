'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const sessionId = document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*\=\s*([^;]*).*$)|^.*$/, "$1")

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      // Clear the session cookie
      document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  )
}


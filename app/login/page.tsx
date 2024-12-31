'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react"

export default function Login() {
  const [username, setUsername] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, adminCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Login failed')
      }

      router.push('/')
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <Card className="w-[400px] sm:w-[500px] md:w-[600px] lg:w-[700px]">
      <CardHeader className="flex flex-col gap-3 py-8">
        <h1 className="text-3xl font-bold text-center">Sign in to your account</h1>
        <p className="text-default-500 text-center">Enter your credentials to access the system</p>
      </CardHeader>

      <CardBody className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            id="username"
            name="username"
            label="Username"
            labelPlacement="outside"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            size="lg"
            classNames={{
              label: "text-lg font-medium"
            }}
          />

          <Input
            id="adminCode"
            name="adminCode"
            label="Admin Code (optional)"
            labelPlacement="outside"
            type="password"
            placeholder="Enter admin code if applicable"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            size="lg"
            classNames={{
              label: "text-lg font-medium"
            }}
          />

          {error && (
            <div className="p-4 text-danger text-medium font-medium text-center bg-danger-50 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            Sign in
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
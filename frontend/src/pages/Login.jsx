import React from 'react'
import { AuthForm } from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-gutter bg-gradient-to-b from-[#F0F7FF] to-[#FFFFFF]">
      <AuthForm />
    </div>
  )
}

import React from 'react'
import { ReactNode } from 'react'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated(); 
  if (!isUserAuthenticated) redirect('/sign-in');
  
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default RootLayout

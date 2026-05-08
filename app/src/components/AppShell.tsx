import { PropsWithChildren } from 'react'
import { useUserPrefs } from '../store/userPrefs'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: PropsWithChildren) {
  const [prefs] = useUserPrefs()
  return (
    <div data-gen={prefs.generation} className="mx-auto min-h-screen max-w-md bg-transparent pb-28">
      {children}
      <BottomNav />
    </div>
  )
}

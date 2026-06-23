import { Link } from 'react-router-dom'
import { Sigma } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
        <Sigma className="h-6 w-6" />
      </div>
      <h1 className="bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-7xl font-extrabold text-transparent">
        404
      </h1>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  )
}

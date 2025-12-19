import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface DashboardCardSkeletonProps {
  count?: number
}

export default function DashboardCardSkeleton({ count = 3 }: DashboardCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <div className="animate-pulse flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded ms-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

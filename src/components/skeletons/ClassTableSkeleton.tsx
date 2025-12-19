import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClassTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-text">جدول الحصص</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: Table Skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  الوقت
                </th>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  رابط الحصة
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-4">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse">
                      <div className="h-9 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card Skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

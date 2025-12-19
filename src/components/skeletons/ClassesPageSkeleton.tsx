import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

/**
 * Loading skeleton for RegularDashboardClasses page
 * RTL-compatible with Arabic text alignment
 * Shows both desktop table and mobile card skeletons
 */
export default function ClassesPageSkeleton() {
  return (
    <Card dir="rtl">
      <CardHeader dir="rtl">
        <CardTitle className="arabic-text flex items-center text-xl text-right" dir="rtl">
          <Calendar className="w-6 h-6 ms-2 text-indigo-600" />
          جدول الحصص
        </CardTitle>
      </CardHeader>
      <CardContent dir="rtl">
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
                  المدة
                </th>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right arabic-text font-semibold text-gray-700">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-4">
                    <div className="animate-pulse flex items-center gap-2 justify-end" dir="rtl">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse flex items-center gap-2 justify-end" dir="rtl">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mr-auto"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse text-right">
                      <div className="h-6 bg-gray-200 rounded-full w-20 mr-auto"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="animate-pulse text-right">
                      <div className="h-9 bg-gray-200 rounded w-28 mr-auto"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card Skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} dir="rtl">
              <CardContent className="p-4" dir="rtl">
                <div className="animate-pulse space-y-3">
                  {/* Date and Status Row */}
                  <div className="flex justify-between items-start" dir="rtl">
                    <div className="space-y-2 flex-1 text-right">
                      {/* Date */}
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      </div>
                      {/* Time */}
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 justify-end" dir="rtl">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  </div>

                  {/* Action Button */}
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

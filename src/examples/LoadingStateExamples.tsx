/**
 * Loading State Examples
 * 
 * Demonstrates the improved loading states with skeleton loaders
 * replacing the old "جاري التحميل..." text
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Skeleton,
  StudentCardSkeleton,
  ClassCardSkeleton,
  TableSkeleton,
  DashboardStatsSkeleton,
  ListSkeleton,
  FormSkeleton,
  CreditManagementSkeleton,
} from '@/components/ui/Skeleton'
import { useAsyncAction } from '@/lib/hooks/useAsyncAction'

export default function LoadingStateExamples() {
  const [showSkeletons, setShowSkeletons] = useState(true)

  // Example async action
  const { execute: handleSave, isLoading: isSaving } = useAsyncAction(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))
    },
    {
      successMessage: 'تم الحفظ بنجاح',
      errorMessage: 'فشل الحفظ'
    }
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Loading State Examples
          </h1>
          <p className="text-gray-600 mb-6">
            Demonstrating skeleton loaders vs old loading text
          </p>
          <Button onClick={() => setShowSkeletons(!showSkeletons)}>
            {showSkeletons ? 'Show Content' : 'Show Skeletons'}
          </Button>
        </div>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Old Way - Loading Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">❌ Old Way (Bad UX)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            </CardContent>
          </Card>

          {/* New Way - Skeleton Loader */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ New Way (Good UX)</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentCardSkeleton />
            </CardContent>
          </Card>
        </div>

        {/* Student Card Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Student Card Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <div className="space-y-4">
                <StudentCardSkeleton />
                <StudentCardSkeleton />
                <StudentCardSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      AH
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ahmed Hassan</h4>
                      <p className="text-sm text-gray-600">ahmed@example.com</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">Age: 15 | Level: Intermediate</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Card Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Class Card Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <div className="space-y-4">
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">English Conversation</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Monday, 4:00 PM - 5:00 PM
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Join</Button>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Table Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4">Ahmed Hassan</td>
                      <td className="px-6 py-4">ahmed@example.com</td>
                      <td className="px-6 py-4">Intermediate</td>
                      <td className="px-6 py-4">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Stats Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <DashboardStatsSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 my-2">156</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600">Active Classes</p>
                  <p className="text-3xl font-bold text-gray-900 my-2">24</p>
                  <p className="text-xs text-green-600">+5% from last month</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Form Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <FormSkeleton fields={4} />
            ) : (
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <Button>Submit</Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Credit Management Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Management Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <CreditManagementSkeleton />
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Add Credits</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Ahmed Hassan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                    <p className="text-2xl font-bold text-blue-600">10</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <Button className="w-full">Add Credits</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Async Button Example */}
        <Card>
          <CardHeader>
            <CardTitle>Async Button Loading State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the button to see the loading state in action
              </p>
              <Button onClick={handleSave} loading={isSaving}>
                {isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>List Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <ListSkeleton items={5} />
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                        {i}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Item {i}</h4>
                        <p className="text-sm text-gray-600">Description for item {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Base Skeleton Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Base Skeleton Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Text Skeleton</p>
                <Skeleton variant="text" className="w-64" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Circular Skeleton</p>
                <Skeleton variant="circular" className="w-16 h-16" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Rectangular Skeleton</p>
                <Skeleton variant="rectangular" className="w-full h-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

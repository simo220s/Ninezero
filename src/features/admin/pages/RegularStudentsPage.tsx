import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, Mail, Users, Copy, Check } from 'lucide-react'
import regularStudentsService, { RegularStudentInfo } from '@/lib/services/regular-students-service'
import { logger } from '@/lib/logger'

export default function RegularStudentsPage() {
  const [students, setStudents] = useState<RegularStudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailsCopied, setEmailsCopied] = useState(false)

  useEffect(() => {
    loadRegularStudents()
  }, [])

  const loadRegularStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await regularStudentsService.getAllRegularStudents()

      if (fetchError) {
        throw fetchError
      }

      setStudents(data || [])
    } catch (err) {
      logger.error('Error loading regular students:', err)
      setError('Failed to load regular students. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = regularStudentsService.exportRegularStudentsToCSV(students)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `regular-students-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)

      logger.log('Regular students CSV exported successfully')
    } catch (err) {
      logger.error('Error exporting CSV:', err)
      setError('Failed to export CSV. Please try again.')
    }
  }

  const handleCopyEmails = async () => {
    try {
      const emails = students.map(s => s.email).join(', ')
      await navigator.clipboard.writeText(emails)
      setEmailsCopied(true)
      setTimeout(() => setEmailsCopied(false), 2000)
      logger.log('Emails copied to clipboard')
    } catch (err) {
      logger.error('Error copying emails:', err)
      setError('Failed to copy emails. Please try again.')
    }
  }

  const handleCopyEmailsList = async () => {
    try {
      const emails = students.map(s => s.email).join('\n')
      await navigator.clipboard.writeText(emails)
      setEmailsCopied(true)
      setTimeout(() => setEmailsCopied(false), 2000)
      logger.log('Email list copied to clipboard')
    } catch (err) {
      logger.error('Error copying email list:', err)
      setError('Failed to copy emails. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading regular students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Regular Students
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage regular (non-trial) student information
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regular Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Active paying students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + (s.credits || 0), 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined class credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Addresses</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter(s => s.email).length}</div>
            <p className="text-xs text-muted-foreground">
              Valid email addresses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Export or copy regular student email addresses for campaigns or communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>

            <Button onClick={handleCopyEmails} variant="outline" className="flex items-center gap-2">
              {emailsCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Emails (Comma-separated)
                </>
              )}
            </Button>

            <Button onClick={handleCopyEmailsList} variant="outline" className="flex items-center gap-2">
              {emailsCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Copy Emails (Line-separated)
                </>
              )}
            </Button>

            <Button onClick={loadRegularStudents} variant="ghost">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regular Students List</CardTitle>
          <CardDescription>
            All students with is_trial = false
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No regular students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Phone</th>
                    <th className="text-left p-3 font-semibold">Credits</th>
                    <th className="text-left p-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
                    >
                      <td className="p-3">{student.full_name}</td>
                      <td className="p-3 font-mono text-xs">{student.email}</td>
                      <td className="p-3">{student.phone || 'N/A'}</td>
                      <td className="p-3 font-semibold">{student.credits?.toFixed(1) || '0.0'}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>
              Preview of all regular student emails (for reference)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <code className="text-xs whitespace-pre-wrap break-all">
                {students.map(s => s.email).join(', ')}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


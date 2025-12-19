import { Coins, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface CreditsCardProps {
  currentBalance: number
  onAddCredits: () => void
}

export default function CreditsCard({ currentBalance, onAddCredits }: CreditsCardProps) {
  // Mock transactions - in real app, fetch from database
  const transactions = [
    {
      id: '1',
      date: new Date().toISOString(),
      amount: 100,
      type: 'purchase' as const,
      description: 'شراء رصيد'
    },
    {
      id: '2',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      amount: -50,
      type: 'usage' as const,
      description: 'حجز حصة فردية'
    },
    {
      id: '3',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 200,
      type: 'purchase' as const,
      description: 'شراء رصيد'
    }
  ]

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 arabic-text flex-1 text-right">رصيد الحصص</h3>
        <Coins className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2 arabic-text text-right">الرصيد المتاح</p>
        <div className="flex items-end gap-2 justify-end">
          <span className="text-sm text-gray-500 mb-1 arabic-text">رصيد</span>
          <span className="text-4xl font-bold text-blue-600">{currentBalance}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 mt-2 justify-end">
          <span className="text-xs arabic-text">+{Math.min(currentBalance, 100)} هالشهر</span>
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <Button 
        onClick={onAddCredits}
        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl mb-6 h-12 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
      >
        <span className="arabic-text">شحن رصيد</span>
        <Plus className="h-4 w-4 mr-2" />
      </Button>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4 arabic-text text-right">آخر العمليات</h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right arabic-text text-xs">التاريخ</TableHead>
                <TableHead className="text-right arabic-text text-xs">المبلغ</TableHead>
                <TableHead className="text-right arabic-text text-xs">النوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="cursor-pointer">
                  <TableCell className="arabic-text text-right text-xs">
                    {new Date(transaction.date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={transaction.type === 'purchase' ? 'default' : 'secondary'} className="arabic-text text-xs">
                      {transaction.description}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}

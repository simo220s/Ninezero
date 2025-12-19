import { Coins, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface EnhancedCreditsCardProps {
  currentBalance: number
  onAddCredits: () => void
}

export default function EnhancedCreditsCard({ currentBalance, onAddCredits }: EnhancedCreditsCardProps) {
  // Mock transactions - in real app, fetch from API
  const transactions = [
    {
      id: "1",
      date: new Date().toISOString(),
      amount: 100,
      type: "purchase" as const,
      description: "شراء رصيد"
    },
    {
      id: "2",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      amount: -50,
      type: "usage" as const,
      description: "حجز حصة فردية"
    },
    {
      id: "3",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 200,
      type: "purchase" as const,
      description: "شراء رصيد"
    }
  ]

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <Coins className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900 arabic-text text-right">رصيد الحصص</h3>
      </div>

      <div className="mb-6 text-right">
        <p className="text-sm text-gray-600 mb-2 arabic-text text-right">الرصيد المتاح</p>
        <div className="flex items-end gap-2 justify-end">
          <span className="text-sm text-gray-500 mb-1 arabic-text">رصيد</span>
          <span className="text-4xl font-bold text-blue-600">{currentBalance}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 mt-2 justify-end">
          <span className="text-sm arabic-text">+100 هالشهر</span>
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <Button 
        onClick={onAddCredits}
        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/20 transition-all"
      >
        <Plus className="h-4 w-4 ml-2 text-white" />
        <span className="arabic-text text-white font-semibold">شحن رصيد</span>
      </Button>
    </Card>
  )
}

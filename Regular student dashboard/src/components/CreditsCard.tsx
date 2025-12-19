import { Coins, Plus, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "purchase" | "usage";
  status: "completed" | "pending";
  description: string;
}

interface CreditsCardProps {
  onAddCredits: () => void;
}

export default function CreditsCard({ onAddCredits }: CreditsCardProps) {
  const currentBalance = 450;
  
  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2025-11-01",
      amount: 100,
      type: "purchase",
      status: "completed",
      description: "شراء رصيد"
    },
    {
      id: "2",
      date: "2025-10-28",
      amount: -50,
      type: "usage",
      status: "completed",
      description: "حجز حصة فردية"
    },
    {
      id: "3",
      date: "2025-10-25",
      amount: 200,
      type: "purchase",
      status: "completed",
      description: "شراء رصيد"
    }
  ];

  return (
    <Card className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <Coins className="h-5 w-5 text-blue-500" />
        <h3 className="text-gray-900 arabic-text text-right">رصيد الحصص</h3>
      </div>

      <div className="mb-6 text-right">
        <p className="text-gray-600 mb-2 arabic-text text-right">الرصيد المتاح</p>
        <div className="flex items-end gap-2 justify-end">
          <span className="text-gray-500 mb-1 arabic-text">رصيد</span>
          <span className="text-blue-600">{currentBalance}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 mt-2 justify-end">
          <span className="arabic-text">+100 هالشهر</span>
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <Button 
        onClick={onAddCredits}
        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl mb-6 h-12 shadow-lg shadow-blue-500/20 transition-all"
      >
        <Plus className="h-4 w-4 ml-2" />
        <span className="arabic-text">شحن رصيد</span>
      </Button>

      <div>
        <h4 className="text-gray-700 mb-4 arabic-text text-right">آخر العمليات</h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right arabic-text">التاريخ</TableHead>
                <TableHead className="text-right arabic-text">المبلغ</TableHead>
                <TableHead className="text-right arabic-text">النوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="cursor-pointer">
                  <TableCell className="arabic-text text-right">
                    {new Date(transaction.date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={transaction.type === "purchase" ? "default" : "secondary"} className="arabic-text">
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
  );
}

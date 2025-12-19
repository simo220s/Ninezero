import { useState } from "react"
import { CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/toast"

interface EnhancedAddCreditsModalProps {
  open: boolean
  onClose: () => void
}

export default function EnhancedAddCreditsModal({ open, onClose }: EnhancedAddCreditsModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("card")

  const presetAmounts = [50, 100, 200, 500]

  const handlePurchase = () => {
    toast.success(`تم شحن ${selectedAmount} رصيد بنجاح! 🎉`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 arabic-text text-right">شحن الرصيد</DialogTitle>
          <DialogDescription className="arabic-text text-right">
            اختر المبلغ اللي تبي تشحنه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Amounts */}
          <div>
            <Label className="mb-3 block arabic-text text-right font-semibold">اختر المبلغ</Label>
            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "primary" : "outline"}
                  className={`h-16 rounded-2xl active:scale-95 transition-all ${
                    selectedAmount === amount 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{amount}</div>
                    <div className="text-xs opacity-80">ريال</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="custom-amount" className="mb-2 block arabic-text text-right font-semibold">
              أو اكتب مبلغ
            </Label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                placeholder="0"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(Number(e.target.value))
                }}
                className="text-right pr-16 h-12 rounded-2xl"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ريال سعودي
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block arabic-text text-right font-semibold">طريقة الدفع</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 space-x-reverse p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer arabic-text flex items-center gap-2 justify-end">
                  <span>بطاقة ائتمان / مدى</span>
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer mt-2 transition-colors">
                <RadioGroupItem value="apple-pay" id="apple-pay" />
                <Label htmlFor="apple-pay" className="flex-1 cursor-pointer arabic-text text-right">
                  Apple Pay
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 arabic-text">{selectedAmount} ريال</span>
              <span className="text-sm text-gray-600 arabic-text text-right">المبلغ</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 arabic-text">0 ريال</span>
              <span className="text-sm text-gray-600 arabic-text text-right">رسوم المعالجة</span>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600 arabic-text">{selectedAmount} ريال</span>
                <span className="font-semibold text-gray-900 arabic-text text-right">المجموع</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/30 transition-all"
              disabled={selectedAmount === 0}
            >
              <span className="arabic-text font-semibold">ادفع</span>
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-2xl border-gray-300 hover:bg-gray-50 active:scale-95 transition-all h-12 arabic-text"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

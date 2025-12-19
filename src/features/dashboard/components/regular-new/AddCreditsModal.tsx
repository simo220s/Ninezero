import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AddCreditsModalProps {
  open: boolean
  onClose: () => void
  _onSuccess: () => void
}

interface CreditPackage {
  id: string
  credits: number
  price: number
  popular?: boolean
  savings?: string
}

export default function AddCreditsModal({ open, onClose, onSuccess }: AddCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const packages: CreditPackage[] = [
    {
      id: 'small',
      credits: 100,
      price: 100,
    },
    {
      id: 'medium',
      credits: 300,
      price: 270,
      popular: true,
      savings: 'وفر 30 ريال'
    },
    {
      id: 'large',
      credits: 500,
      price: 400,
      savings: 'وفر 100 ريال'
    }
  ]

  const handlePurchase = () => {
    // In real app, this would process the payment
    // For now, just redirect to pricing page
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 arabic-text text-right">
            شحن رصيد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 arabic-text text-right">
            اختر الباقة المناسبة لك
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`p-6 cursor-pointer transition-all relative ${
                  selectedPackage === pkg.id
                    ? 'border-2 border-blue-500 shadow-lg'
                    : 'border border-gray-200 hover:border-blue-300'
                } ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 right-1/2 transform translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold arabic-text">
                      الأكثر شعبية
                    </span>
                  </div>
                )}

                <div className="text-right">
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600">{pkg.credits}</span>
                    <span className="text-gray-600 arabic-text mr-2">رصيد</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-gray-600 arabic-text mr-1">ريال</span>
                  </div>

                  {pkg.savings && (
                    <div className="mb-4">
                      <span className="text-green-600 text-sm font-semibold arabic-text">
                        {pkg.savings}
                      </span>
                    </div>
                  )}

                  {selectedPackage === pkg.id && (
                    <div className="flex items-center justify-end">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 arabic-text text-right">
              💡 نصيحة: الباقات الأكبر توفر لك المزيد من المال
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 arabic-text"
            >
              إلغاء
            </Button>
            <Button
              asChild
              disabled={!selectedPackage}
              className="flex-1 arabic-text"
            >
              <Link to="/#pricing" onClick={handlePurchase}>
                متابعة للدفع
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

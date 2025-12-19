import { useEffect, useState } from 'react';

interface ConversionWelcomeProps {
  show: boolean;
  onDismiss: () => void;
}

export default function ConversionWelcome({ show, onDismiss }: ConversionWelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Delay to allow animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onDismiss}
      />

      {/* Welcome Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Celebration Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary animate-pulse">
                <span className="material-symbols-outlined text-5xl text-white">
                  celebration
                </span>
              </div>
              {/* Confetti effect */}
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🎉</div>
              <div className="absolute -top-2 -left-2 text-4xl animate-bounce delay-100">✨</div>
              <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce delay-200">🎊</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            مبروك! 🎉
          </h2>

          {/* Message */}
          <div className="text-center space-y-4 mb-8">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              تم تفعيل حسابك كطالب منتظم بنجاح!
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              يمكنك الآن حجز الحصص والاستفادة من جميع ميزات المنصة.
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                💡 نتمنى لك رحلة تعليمية ممتعة ومثمرة!
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  حجز حصص غير محدودة
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  احجز الحصص التي تناسب جدولك
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  متابعة تقدمك
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  شاهد سجل حصصك وتقييماتك
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  إدارة رصيدك
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  شحن وإدارة رصيد الحصص بسهولة
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onDismiss}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-primary-600 to-secondary text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            ابدأ الآن
          </button>
        </div>
      </div>
    </>
  );
}

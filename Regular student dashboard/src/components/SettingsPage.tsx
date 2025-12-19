import { useState } from "react";
import { User, Bell, Lock, Globe, CreditCard, Shield, Moon, Sun } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [classReminders, setClassReminders] = useState(true);

  const handleSaveProfile = () => {
    toast.success("تم حفظ التعديلات بنجاح ✓");
  };

  const handleChangePassword = () => {
    toast.success("تم تغيير كلمة المرور");
  };

  const handleSaveNotifications = () => {
    toast.success("تم حفظ إعدادات الإشعارات");
  };

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-right">
          <h1 className="text-gray-900 mb-2 arabic-text text-right">الإعدادات ⚙️</h1>
          <p className="text-gray-600 arabic-text text-right">أدير حسابك وتفضيلاتك</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h2 className="text-gray-900 arabic-text text-right">المعلومات الشخصية</h2>
              <User className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block arabic-text text-right">الاسم الكامل</Label>
                <Input 
                  id="name" 
                  defaultValue="أحمد محمد" 
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block arabic-text text-right">البريد الإلكتروني</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue="ahmad@example.com" 
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block arabic-text text-right">رقم الجوال</Label>
                <Input 
                  id="phone" 
                  defaultValue="+966 50 123 4567" 
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="timezone" className="mb-2 block arabic-text text-right">المنطقة الزمنية</Label>
                <Select defaultValue="riyadh" dir="rtl">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="riyadh">الرياض (GMT+3)</SelectItem>
                    <SelectItem value="jeddah">جدة (GMT+3)</SelectItem>
                    <SelectItem value="dubai">دبي (GMT+4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSaveProfile}
                className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/20 transition-all"
              >
                <span className="arabic-text">حفظ التعديلات</span>
              </Button>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h2 className="text-gray-900 arabic-text text-right">الأمان</h2>
              <Lock className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="mb-2 block arabic-text text-right">كلمة المرور الحالية</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  placeholder="••••••••"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="mb-2 block arabic-text text-right">كلمة المرور الجديدة</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  placeholder="••••••••"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="mb-2 block arabic-text text-right">تأكيد كلمة المرور</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="••••••••"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <Button 
                onClick={handleChangePassword}
                variant="outline"
                className="w-full rounded-2xl h-12 border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <span className="arabic-text">تغيير كلمة المرور</span>
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h2 className="text-gray-900 arabic-text text-right">الإشعارات</h2>
              <Bell className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <div className="text-right flex-1 mr-4">
                  <Label className="arabic-text">إشعارات البريد الإلكتروني</Label>
                  <p className="text-gray-500 arabic-text">استقبل الإشعارات عبر البريد</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
                <div className="text-right flex-1 mr-4">
                  <Label className="arabic-text">الإشعارات الفورية</Label>
                  <p className="text-gray-500 arabic-text">استقبل الإشعارات على الجهاز</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Switch 
                  checked={classReminders}
                  onCheckedChange={setClassReminders}
                />
                <div className="text-right flex-1 mr-4">
                  <Label className="arabic-text">تذكير الحصص</Label>
                  <p className="text-gray-500 arabic-text">تنبيهات قبل بداية الحصة</p>
                </div>
              </div>

              <Button 
                onClick={handleSaveNotifications}
                className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl h-12 shadow-lg shadow-blue-500/20 transition-all mt-6"
              >
                <span className="arabic-text">حفظ الإعدادات</span>
              </Button>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6 md:p-8 bg-white border border-gray-200 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h2 className="text-gray-900 arabic-text text-right">المظهر</h2>
              <Globe className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch 
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked);
                    toast.info(checked ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري");
                  }}
                />
                <div className="text-right flex-1 mr-4">
                  <Label className="arabic-text flex items-center gap-2 justify-end">
                    <span>الوضع الليلي</span>
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Label>
                  <p className="text-gray-500 arabic-text">تقليل سطوع الشاشة</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block arabic-text text-right">اللغة</Label>
                <Select defaultValue="ar" dir="rtl">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 md:p-8 bg-red-50 border border-red-200 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 justify-end">
              <h2 className="text-red-900 arabic-text text-right">منطقة الخطر</h2>
              <Shield className="h-5 w-5 text-red-500" />
            </div>

            <p className="text-red-700 mb-4 arabic-text text-right">
              حذف الحساب نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <Button 
              onClick={() => toast.error("يرجى التواصل مع الدعم لحذف الحساب")}
              variant="destructive"
              className="w-full rounded-2xl h-12 active:scale-95 transition-all"
            >
              <span className="arabic-text">حذف الحساب</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

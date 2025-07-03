"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PageLoading } from '@/components/ui/page-loading';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Database, 
  Shield, 
  Palette,
  Save,
  Download,
  Upload,
  Mail,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  // General Settings
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  
  // Notification Settings
  lowStockAlerts: boolean;
  outOfStockAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  lowStockThreshold: number;
  
  // System Settings
  currency: string;
  dateFormat: string;
  timezone: string;
  language: string;
  
  // Security Settings
  sessionTimeout: number;
  requirePasswordChange: boolean;
  twoFactorAuth: boolean;
  
  // Display Settings
  theme: string;
  itemsPerPage: number;
  showProductImages: boolean;
  compactView: boolean;
  
  // Metadata
  lastUpdated?: string;
  version?: string;
}

interface SystemTest {
  overall: 'healthy' | 'warning' | 'error';
  timestamp: string;
  tests: {
    database: { status: string; message: string; responseTime: number };
    memory: { status: string; usage: number; available: number };
    disk: { status: string; usage: number; available: number };
    network: { status: string; latency: number };
  };
}

interface SessionData {
  sessions: Array<{
    id: string;
    userId: string;
    userAgent: string;
    ipAddress: string;
    loginTime: string;
    lastActivity: string;
    location: string;
  }>;
  totalSessions: number;
  activeSessions: number;
}

export default function SettingsPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [testingSystem, setTestingSystem] = useState(false);
  const [systemTest, setSystemTest] = useState<SystemTest | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    // General Settings
    companyName: 'Inventory Pro',
    companyEmail: 'admin@company.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business St, City, State 12345',
    
    // Notification Settings
    lowStockAlerts: true,
    outOfStockAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
    lowStockThreshold: 10,
    
    // System Settings
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
    language: 'en',
    
    // Security Settings
    sessionTimeout: 30,
    requirePasswordChange: false,
    twoFactorAuth: false,
    
    // Display Settings
    theme: 'system',
    itemsPerPage: 10,
    showProductImages: true,
    compactView: false,
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        
        // Apply theme immediately if mounted
        if (mounted && data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSave = async (section: string, sectionSettings: Partial<SettingsData>) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionSettings),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(result.settings);
        toast.success(`${section} settings saved successfully`);
        
        // Apply theme change immediately if it's a display setting
        if (sectionSettings.theme && mounted) {
          setTheme(sectionSettings.theme);
        }
        
        // Show applied changes
        if (result.appliedChanges?.length > 0) {
          console.log('✅ Applied changes:', result.appliedChanges);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLowStockAlert = async () => {
    try {
      setSendingNotification(true);
      
      const response = await fetch('/api/notifications/low-stock', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        if (result.count > 0) {
          toast.success(`Low stock alert sent! Found ${result.count} items that need attention.`);
          console.log('📧 Low stock products:', result.products);
        } else {
          toast.success('No low stock items found - all inventory levels are healthy!');
        }
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleSystemTest = async () => {
    try {
      setTestingSystem(true);
      
      const response = await fetch('/api/system/test', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setSystemTest(result);
        
        const statusMessage = result.overall === 'healthy' 
          ? 'All systems are running normally' 
          : result.overall === 'warning'
            ? 'Some systems need attention'
            : 'Critical system issues detected';
            
        toast.success(`System test completed: ${statusMessage}`);
      } else {
        toast.error('Failed to run system test');
      }
    } catch (error) {
      console.error('Error running system test:', error);
      toast.error('Failed to run system test');
    } finally {
      setTestingSystem(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch('/api/security/session');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/security/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        toast.success('Session terminated successfully');
        fetchSessions();
      } else {
        toast.error('Failed to terminate session');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (confirm('Are you sure you want to terminate all sessions? This will log out all users.')) {
      try {
        const response = await fetch('/api/security/session', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'terminate-all' }),
        });

        if (response.ok) {
          toast.success('All sessions terminated successfully');
          fetchSessions();
        } else {
          toast.error('Failed to terminate sessions');
        }
      } catch (error) {
        console.error('Error terminating all sessions:', error);
        toast.error('Failed to terminate sessions');
      }
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      try {
        setSaving(true);
        const response = await fetch('/api/settings', {
          method: 'DELETE',
        });

        if (response.ok) {
          const result = await response.json();
          setSettings(result.settings);
          if (mounted) {
            setTheme(result.settings.theme);
          }
          toast.success('Settings reset to defaults successfully');
        } else {
          toast.error('Failed to reset settings');
        }
      } catch (error) {
        console.error('Error resetting settings:', error);
        toast.error('Failed to reset settings');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleExportData = () => {
    const exportData = {
      settings,
      systemInfo: systemTest,
      exportDate: new Date().toISOString(),
      version: settings.version || '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const importedData = JSON.parse(text);
          
          if (importedData.settings) {
            setSettings(importedData.settings);
            await handleSave('Imported', importedData.settings);
            toast.success('Settings imported successfully');
          } else {
            toast.error('Invalid settings file format');
          }
        } catch (error) {
          console.error('Error importing settings:', error);
          toast.error('Failed to import settings');
        }
      }
    };
    input.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Settings" description="Configure your inventory management system" />
      
      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <User className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="dark:text-white">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="dark:text-white">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone" className="dark:text-white">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="dark:text-white">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                    rows={3}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button 
                  onClick={() => handleSave('General', {
                    companyName: settings.companyName,
                    companyEmail: settings.companyEmail,
                    companyPhone: settings.companyPhone,
                    companyAddress: settings.companyAddress
                  })} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowStockAlerts" className="dark:text-white">Low Stock Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when products are running low</p>
                    </div>
                    <Switch
                      id="lowStockAlerts"
                      checked={settings.lowStockAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, lowStockAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="outOfStockAlerts" className="dark:text-white">Out of Stock Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when products are out of stock</p>
                    </div>
                    <Switch
                      id="outOfStockAlerts"
                      checked={settings.outOfStockAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, outOfStockAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="dark:text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications" className="dark:text-white">Push Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className="dark:text-white">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                    className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Alert when stock falls below this number</p>
                </div>
                
                {/* Test Notification */}
                <div className="border-t pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="dark:text-white">Test Low Stock Alert</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Send a test notification for current low stock items</p>
                    </div>
                    <Button
                      onClick={handleTestLowStockAlert}
                      disabled={sendingNotification || !settings.emailNotifications}
                      variant="outline"
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {sendingNotification ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send Test Alert
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSave('Notification', {
                    lowStockAlerts: settings.lowStockAlerts,
                    outOfStockAlerts: settings.outOfStockAlerts,
                    emailNotifications: settings.emailNotifications,
                    pushNotifications: settings.pushNotifications,
                    lowStockThreshold: settings.lowStockThreshold
                  })} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Database className="h-5 w-5" />
                    <span>System Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="dark:text-white">Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                          <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                          <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat" className="dark:text-white">Date Format</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="dark:text-white">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="dark:text-white">Language</Label>
                      <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                          <SelectItem value="fr">🇫🇷 French</SelectItem>
                          <SelectItem value="de">🇩🇪 German</SelectItem>
                          <SelectItem value="it">🇮🇹 Italian</SelectItem>
                          <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSave('System', {
                      currency: settings.currency,
                      dateFormat: settings.dateFormat,
                      timezone: settings.timezone,
                      language: settings.language
                    })} 
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>System Health</span>
                    </div>
                    <Button
                      onClick={handleSystemTest}
                      disabled={testingSystem}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {testingSystem ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Run Test
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemTest ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium dark:text-white">Overall Status</span>
                        <Badge className={getStatusColor(systemTest.overall)}>
                          {systemTest.overall.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300">Database</span>
                            <Badge className={getStatusColor(systemTest.tests.database.status)}>
                              {systemTest.tests.database.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {systemTest.tests.database.message} ({systemTest.tests.database.responseTime}ms)
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300">Memory</span>
                            <Badge className={getStatusColor(systemTest.tests.memory.status)}>
                              {systemTest.tests.memory.usage}MB / {systemTest.tests.memory.available}MB
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300">Disk Space</span>
                            <Badge className={getStatusColor(systemTest.tests.disk.status)}>
                              {systemTest.tests.disk.usage}% used
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300">Network</span>
                            <Badge className={getStatusColor(systemTest.tests.network.status)}>
                              {systemTest.tests.network.latency}ms
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last tested: {new Date(systemTest.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Click "Run Test" to check system health</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="dark:text-white">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="480"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                        className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically log out after this period of inactivity (5-480 minutes)</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requirePasswordChange" className="dark:text-white">Require Password Change</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Force users to change passwords every 90 days</p>
                      </div>
                      <Switch
                        id="requirePasswordChange"
                        checked={settings.requirePasswordChange}
                        onCheckedChange={(checked) => setSettings({...settings, requirePasswordChange: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth" className="dark:text-white">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSave('Security', {
                      sessionTimeout: settings.sessionTimeout,
                      requirePasswordChange: settings.requirePasswordChange,
                      twoFactorAuth: settings.twoFactorAuth
                    })} 
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Session Management */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Active Sessions</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={fetchSessions}
                        disabled={loadingSessions}
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        {loadingSessions ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleTerminateAllSessions}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Terminate All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Sessions:</span>
                          <p className="font-medium dark:text-white">{sessions.totalSessions}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Active Sessions:</span>
                          <p className="font-medium dark:text-white">{sessions.activeSessions}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Current Timeout:</span>
                          <p className="font-medium dark:text-white">{settings.sessionTimeout} minutes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {sessions.sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                {session.userAgent.includes('Mobile') ? (
                                  <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium dark:text-white">{session.userId}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {session.ipAddress} • {session.location}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  Last active: {new Date(session.lastActivity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleTerminateSession(session.id)}
                              variant="outline"
                              size="sm"
                              className="dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Click refresh to load active sessions</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <Palette className="h-5 w-5" />
                  <span>Display Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="dark:text-white">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => {
                        setSettings({...settings, theme: value});
                        if (mounted) {
                          setTheme(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="light">☀️ Light</SelectItem>
                        <SelectItem value="dark">🌙 Dark</SelectItem>
                        <SelectItem value="system">🖥️ Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage" className="dark:text-white">Items Per Page</Label>
                    <Select value={settings.itemsPerPage.toString()} onValueChange={(value) => setSettings({...settings, itemsPerPage: parseInt(value)})}>
                      <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showProductImages" className="dark:text-white">Show Product Images</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Display product images in lists and cards</p>
                    </div>
                    <Switch
                      id="showProductImages"
                      checked={settings.showProductImages}
                      onCheckedChange={(checked) => setSettings({...settings, showProductImages: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactView" className="dark:text-white">Compact View</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use a more compact layout to show more items</p>
                    </div>
                    <Switch
                      id="compactView"
                      checked={settings.compactView}
                      onCheckedChange={(checked) => setSettings({...settings, compactView: checked})}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSave('Display', {
                    theme: settings.theme,
                    itemsPerPage: settings.itemsPerPage,
                    showProductImages: settings.showProductImages,
                    compactView: settings.compactView
                  })} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Download className="h-5 w-5" />
                    <span>Export Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Export your settings and configuration for backup or migration purposes.
                  </p>
                  <Button onClick={handleExportData} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Upload className="h-5 w-5" />
                    <span>Import Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Import settings from a previously exported configuration file.
                  </p>
                  <Button onClick={handleImportData} variant="outline" className="dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <RotateCcw className="h-5 w-5" />
                    <span>Reset Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Reset all settings to their default values. This action cannot be undone.
                  </p>
                  <Button 
                    onClick={handleResetSettings} 
                    variant="destructive"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Info */}
              {settings.lastUpdated && (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Globe className="h-5 w-5" />
                      <span>Settings Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                        <p className="font-medium dark:text-white">
                          {new Date(settings.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <p className="font-medium dark:text-white">{settings.version || '1.0'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Theme:</span>
                        <p className="font-medium dark:text-white capitalize">{settings.theme}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Language:</span>
                        <p className="font-medium dark:text-white">{settings.language.toUpperCase()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
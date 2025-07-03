import { NextRequest, NextResponse } from 'next/server';

// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory store with persistence simulation
let settingsStore = {
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
  
  // Metadata
  lastUpdated: new Date().toISOString(),
  version: '1.0'
};

export async function GET() {
  try {
    console.log('🚀 Settings API - GET called');
    
    // Simulate loading from database
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      ...settingsStore,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 Settings API - PUT called');
    const updates = await request.json();
    
    // Validate settings based on type
    const validatedUpdates = validateSettings(updates);
    
    // Update the settings store
    settingsStore = { 
      ...settingsStore, 
      ...validatedUpdates,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Settings updated:', Object.keys(validatedUpdates));
    
    // Apply system-level changes
    await applySystemChanges(validatedUpdates);
    
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: settingsStore,
      appliedChanges: Object.keys(validatedUpdates)
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json({ 
      error: 'Failed to update settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function validateSettings(updates: any) {
  const validated: any = {};
  
  // Validate each setting type
  Object.keys(updates).forEach(key => {
    const value = updates[key];
    
    switch (key) {
      case 'sessionTimeout':
        validated[key] = Math.max(5, Math.min(480, parseInt(value) || 30)); // 5 min to 8 hours
        break;
      case 'lowStockThreshold':
        validated[key] = Math.max(0, Math.min(1000, parseInt(value) || 10));
        break;
      case 'itemsPerPage':
        validated[key] = [5, 10, 25, 50, 100].includes(parseInt(value)) ? parseInt(value) : 10;
        break;
      case 'currency':
        validated[key] = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'].includes(value) ? value : 'USD';
        break;
      case 'dateFormat':
        validated[key] = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(value) ? value : 'MM/DD/YYYY';
        break;
      case 'timezone':
        // Validate timezone (simplified)
        validated[key] = value || 'America/New_York';
        break;
      case 'language':
        validated[key] = ['en', 'es', 'fr', 'de', 'it', 'pt'].includes(value) ? value : 'en';
        break;
      case 'theme':
        validated[key] = ['light', 'dark', 'system'].includes(value) ? value : 'system';
        break;
      default:
        // For other settings, accept as-is if they're valid types
        if (typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
          validated[key] = value;
        }
    }
  });
  
  return validated;
}

async function applySystemChanges(updates: any) {
  // Simulate applying system-level changes
  if (updates.emailNotifications !== undefined) {
    console.log(`📧 Email notifications ${updates.emailNotifications ? 'enabled' : 'disabled'}`);
  }
  
  if (updates.twoFactorAuth !== undefined) {
    console.log(`🔐 Two-factor authentication ${updates.twoFactorAuth ? 'enabled' : 'disabled'}`);
  }
  
  if (updates.sessionTimeout !== undefined) {
    console.log(`⏱️ Session timeout set to ${updates.sessionTimeout} minutes`);
  }
  
  if (updates.currency !== undefined) {
    console.log(`💰 Currency changed to ${updates.currency}`);
  }
  
  if (updates.theme !== undefined) {
    console.log(`🎨 Theme changed to ${updates.theme}`);
  }
  
  if (updates.language !== undefined) {
    console.log(`🌐 Language changed to ${updates.language}`);
  }
}

export async function DELETE() {
  try {
    console.log('🚀 Settings API - RESET called');
    
    // Reset to default settings
    settingsStore = {
      companyName: 'Inventory Pro',
      companyEmail: 'admin@company.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 Business St, City, State 12345',
      lowStockAlerts: true,
      outOfStockAlerts: true,
      emailNotifications: true,
      pushNotifications: false,
      lowStockThreshold: 10,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'America/New_York',
      language: 'en',
      sessionTimeout: 30,
      requirePasswordChange: false,
      twoFactorAuth: false,
      theme: 'system',
      itemsPerPage: 10,
      showProductImages: true,
      compactView: false,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    console.log('✅ Settings reset to defaults');
    
    return NextResponse.json({ 
      message: 'Settings reset to defaults successfully',
      settings: settingsStore 
    });
  } catch (error) {
    console.error('❌ Error resetting settings:', error);
    return NextResponse.json({ 
      error: 'Failed to reset settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
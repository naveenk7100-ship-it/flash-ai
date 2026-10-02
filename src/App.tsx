import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NotificationToast } from './components/layout/NotificationToast';

import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ContentPlanner } from './components/planner/ContentPlanner';
import { ContentGenerator } from './components/generator/ContentGenerator';
import { ApprovalQueue } from './components/approval/ApprovalQueue';
import { PublishedContent } from './components/published/PublishedContent';
import { PublishingActivityLog } from './components/activity/PublishingActivityLog';
import { LeadTracker } from './components/leads/LeadTracker';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { MediaStudioView } from './components/media/MediaStudioView';
import { EngagementInbox } from './components/engagement/EngagementInbox';
import { AutomationControlCenter } from './components/automation/AutomationControlCenter';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      <ErrorBoundary fallbackTitle="View Temporarily Unavailable">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'automation' && <AutomationControlCenter />}
        {activeTab === 'planner' && <ContentPlanner />}
        {activeTab === 'generator' && <ContentGenerator />}
        {activeTab === 'media' && <MediaStudioView />}
        {activeTab === 'approval' && <ApprovalQueue />}
        {activeTab === 'published' && <PublishedContent />}
        {activeTab === 'inbox' && <EngagementInbox />}
        {activeTab === 'activity' && <PublishingActivityLog />}
        {activeTab === 'leads' && <LeadTracker />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </ErrorBoundary>
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#07090e] text-slate-100 cyber-grid flex flex-col selection:bg-cyan-500 selection:text-black">
        {/* Top Header */}
        <Header />

        {/* Layout Body: Sidebar + Main Content */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <Sidebar />
          <MainContent />
        </div>

        {/* Mobile-first Bottom Navigation (320px - 480px friendly) */}
        <MobileBottomNav />

        {/* Global Toast Notifications */}
        <NotificationToast />
      </div>
    </AppProvider>
  );
}

export default App;

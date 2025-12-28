import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { MemberManager } from './components/MemberManager'
import { ServiceSession } from './components/ServiceSession'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { StorageService } from './services/StorageService'
import { MonthlySummary } from './components/MonthlySummary'
import { ToastContainer } from './components/Toast'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Handler
  const showToast = (message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load members on mount and sanitize data
  useEffect(() => {
    const loadedMembers = StorageService.getMembers();

    // Data Migration: Ensure all members have IDs
    const sanitizedMembers = loadedMembers.map(m => ({
      ...m,
      id: m.id || crypto.randomUUID()
    }));

    // If we changed anything (added IDs), save it back immediately to fix the storage
    if (JSON.stringify(loadedMembers) !== JSON.stringify(sanitizedMembers)) {
      console.log("Migrating legacy data: Added IDs to members.");
      StorageService.saveMembers(sanitizedMembers);
    }

    setMembers(sanitizedMembers);
    setIsLoaded(true);
  }, []);

  // Save members whenever they change
  useEffect(() => {
    // Only save if we have finished loading the initial data
    if (isLoaded) {
      StorageService.saveMembers(members);
    }
  }, [members, isLoaded]);

  const handleImportMembers = (newMembers) => {
    console.log("App: handleImportMembers called with count:", newMembers.length);
    // showToast("Updating member database...", 'info'); 
    setMembers(newMembers);
  };

  const [currentServiceData, setCurrentServiceData] = useState({
    serviceType: 'Sunday Morning',
    date: '',
    transactions: [],
    cashCounts: {}
  });

  const handleAddMember = (member) => {
    setMembers([...members, member]);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />


      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="max-w-6xl mx-auto w-full print:hidden">
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 mt-1">Overview of your church records.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h2a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2h8zM9 4a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Members</h3>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Include Analytics Dashboard here as part of the main Dashboard view if desired, or just keep it simple */}
          <div className="print:hidden">
            <AnalyticsDashboard />
          </div>
          <MonthlySummary />
        </div>
      )}

      {activeTab === 'members' && (
        <MemberManager
          members={members}
          onAddMember={handleAddMember}
          onImportMembers={handleImportMembers}
          showToast={showToast}
        />
      )}

      {activeTab === 'giving' && (
        <ServiceSession
          members={members}
          serviceData={currentServiceData}
          onUpdateServiceData={setCurrentServiceData}
          showToast={showToast}
        />
      )}
    </Layout>
  )
}

export default App

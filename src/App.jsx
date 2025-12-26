import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { MemberManager } from './components/MemberManager'
import { ServiceSession } from './components/ServiceSession'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { StorageService } from './services/StorageService'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load members on mount
  useEffect(() => {
    const loadedMembers = StorageService.getMembers();
    setMembers(loadedMembers);
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
    setMembers(newMembers);
  };

  // Transactions could be stored in a more complex structure (by date/service), 
  // but for now we can keep them here or inside ServiceSession if they don't need to persist across tabs heavily yet.
  // Ideally, state should be hoisted if we want to switch tabs without losing data.
  // For this MV, I'll pass a simple handler or let ServiceSession manage its own ephemeral state per session, 
  // or hoist it here. Let's hoist it to keep it safe.
  const [currentServiceData, setCurrentServiceData] = useState({
    serviceType: 'Sunday Morning',
    date: new Date().toISOString().split('T')[0],
    transactions: []
  });

  const handleAddMember = (member) => {
    setMembers([...members, member]);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="max-w-6xl mx-auto w-full">
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 mt-1">Overview of your church records.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
          <AnalyticsDashboard />
        </div>
      )}

      {activeTab === 'members' && (
        <MemberManager
          members={members}
          onAddMember={handleAddMember}
          onImportMembers={handleImportMembers}
        />
      )}

      {activeTab === 'giving' && (
        <ServiceSession
          members={members}
          serviceData={currentServiceData}
          onUpdateServiceData={setCurrentServiceData}
        />
      )}
    </Layout>
  )
}

export default App

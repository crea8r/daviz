import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProvider } from './contexts/WalletProvider';
import { BusinessMarketplace } from './components/BusinessMarketplace';
import { ConsultantDashboard } from './components/ConsultantDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'consultant'>('marketplace');
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Daviz Marketplace
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {connected && publicKey && (
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                </div>
              )}
              <WalletMultiButton className="!bg-gradient-to-r !from-indigo-600 !to-cyan-600 hover:!from-indigo-700 hover:!to-cyan-700 !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-4 px-6 relative font-medium text-sm transition-all duration-200 ${
                activeTab === 'marketplace'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Business Discovery (A4)</span>
              </span>
              {activeTab === 'marketplace' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('consultant')}
              className={`py-4 px-6 relative font-medium text-sm transition-all duration-200 ${
                activeTab === 'consultant'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <span>Consultant Dashboard (A5)</span>
              </span>
              {activeTab === 'consultant' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        {!connected && (
          <div className="text-center py-12 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Daviz Marketplace</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Connect your wallet to discover trusted businesses or manage consultant orders.
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-200/50 rounded-2xl p-6 mb-8 backdrop-blur-sm shadow-lg">
                <h3 className="font-semibold text-indigo-900 mb-4 text-lg">User Roles:</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">A4</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-indigo-900">Buyers</div>
                      <div className="text-sm text-indigo-700">Discover and connect with trusted businesses</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">A5</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-cyan-900">Consultants</div>
                      <div className="text-sm text-cyan-700">Manage client orders and projects</div>
                    </div>
                  </div>
                </div>
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-indigo-600 !to-cyan-600 hover:!from-indigo-700 hover:!to-cyan-700 !text-base !py-3 !px-8 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
            </div>
          </div>
        )}

        {connected && (
          <div>
            {activeTab === 'marketplace' && <BusinessMarketplace />}
            {activeTab === 'consultant' && <ConsultantDashboard />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600">
              Daviz Marketplace Platform
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Connecting Buyers with Trusted Businesses</span>
              <span>•</span>
              <span>Powered by Solana</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;

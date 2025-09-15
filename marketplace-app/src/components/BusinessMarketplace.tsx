import React, { useState, useEffect } from 'react';
import { useDavizClient, useOrderManager } from '../hooks/useDavizClient';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface TrustRecord {
  publicKey: PublicKey;
  account: {
    framework: PublicKey;
    issuer: PublicKey;
    targetAsset: PublicKey;
    trustScore: number;
    evidence: string;
    isActive: boolean;
    issuedAt: any;
    expiresAt?: any;
  };
  framework?: {
    publicKey: PublicKey;
    account: {
      name: string;
      description: string;
      criteria: string[];
    };
  };
  asset?: {
    publicKey: PublicKey;
    account: {
      owner: PublicKey;
      assetId: any;
      name: string;
      description: string;
      assetType: any;
      isActive: boolean;
    };
  };
}

export const BusinessMarketplace: React.FC = () => {
  const client = useDavizClient();
  const orderManager = useOrderManager();
  const { connected } = useWallet();

  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<TrustRecord[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<TrustRecord[]>([]);

  const [filters, setFilters] = useState({
    minTrustScore: '',
    maxTrustScore: '',
    searchTerm: '',
    assetType: '',
  });

  const [selectedBusiness, setSelectedBusiness] = useState<TrustRecord | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    message: '',
    contactInfo: '',
    budget: '',
    timeline: '',
  });

  // Load businesses with trust records
  useEffect(() => {
    if (client && connected) {
      loadBusinesses();
    }
  }, [client, connected]);

  // Apply filters
  useEffect(() => {
    let filtered = [...businesses];

    if (filters.minTrustScore) {
      filtered = filtered.filter(b => b.account.trustScore >= parseInt(filters.minTrustScore));
    }

    if (filters.maxTrustScore) {
      filtered = filtered.filter(b => b.account.trustScore <= parseInt(filters.maxTrustScore));
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.asset?.account.name.toLowerCase().includes(term) ||
        b.asset?.account.description.toLowerCase().includes(term) ||
        b.framework?.account.name.toLowerCase().includes(term)
      );
    }

    if (filters.assetType) {
      filtered = filtered.filter(b => {
        const assetType = Object.keys(b.asset?.account.assetType || {})[0];
        return assetType?.toLowerCase() === filters.assetType.toLowerCase();
      });
    }

    setFilteredBusinesses(filtered);
  }, [businesses, filters]);

  const loadBusinesses = async () => {
    if (!client) return;

    setLoading(true);
    try {
      const recordsWithDetails = await client.getAllTrustRecordsWithDetails();

      // Filter out records without asset or framework details, and inactive records
      const validBusinesses = recordsWithDetails.filter(record =>
        record.asset &&
        record.framework &&
        record.account.isActive &&
        record.asset.account.isActive &&
        record.framework.account.isActive
      );

      setBusinesses(validBusinesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedBusiness?.asset) return;

    try {
      const order = orderManager.createOrder({
        buyerAddress: client?.provider.wallet.publicKey.toString() || '',
        assetPda: selectedBusiness.asset.publicKey.toString(),
        message: orderForm.message,
        contactInfo: orderForm.contactInfo,
        budget: orderForm.budget,
        timeline: orderForm.timeline,
      });

      console.log('Order created:', order);

      // Reset form
      setOrderForm({
        message: '',
        contactInfo: '',
        budget: '',
        timeline: '',
      });
      setShowOrderForm(false);
      setSelectedBusiness(null);

      alert('Interest order placed successfully! Consultants will be notified.');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const getAssetTypeDisplay = (assetType: any) => {
    const type = Object.keys(assetType || {})[0];
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Marketplace</h2>
        <p className="text-gray-600 mb-8">
          Connect your wallet to discover trusted businesses and place orders.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Trusted Business Marketplace</h2>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span>Search & Filter</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search businesses..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Trust Score</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minTrustScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minTrustScore: e.target.value }))}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Trust Score</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.maxTrustScore}
              onChange={(e) => setFilters(prev => ({ ...prev, maxTrustScore: e.target.value }))}
              placeholder="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Type</label>
            <select
              value={filters.assetType}
              onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            >
              <option value="">All Types</option>
              <option value="business">Business</option>
              <option value="realestate">Real Estate</option>
              <option value="intellectual">Intellectual</option>
              <option value="digital">Digital</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFilters({ minTrustScore: '', maxTrustScore: '', searchTerm: '', assetType: '' })}
            className="inline-flex items-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading trusted businesses...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredBusinesses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {businesses.length === 0
              ? 'No businesses with trust certificates found. A2 needs to issue certificates first.'
              : 'No businesses match your search criteria.'
            }
          </p>
        </div>
      )}

      {/* Business Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <div key={business.publicKey.toString()} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{business.asset?.account.name}</h3>
              <div className={`text-2xl font-bold px-3 py-1 rounded-xl ${getTrustScoreColor(business.account.trustScore)} bg-gray-50`}>
                {business.account.trustScore}/100
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {getAssetTypeDisplay(business.asset?.account.assetType)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Framework:</strong> {business.framework?.account.name}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {business.asset?.account.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-xl mb-4 border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <strong>Trust Evidence:</strong> {business.account.evidence}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedBusiness(business);
                setShowOrderForm(true);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <span>Place Interest Order</span>
            </button>
          </div>
        ))}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedBusiness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Place Interest Order</h3>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200/50 rounded-xl p-4 mb-6">
              <p className="text-indigo-800 font-medium">
                for <strong>{selectedBusiness.asset?.account.name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={orderForm.message}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  placeholder="Describe your interest and requirements..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Information *
                </label>
                <input
                  required
                  type="text"
                  value={orderForm.contactInfo}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder="Email, phone, or Telegram..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="text"
                  value={orderForm.budget}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Expected budget range..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Timeline (Optional)
                </label>
                <input
                  type="text"
                  value={orderForm.timeline}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="When do you need this completed?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowOrderForm(false);
                  setSelectedBusiness(null);
                  setOrderForm({ message: '', contactInfo: '', budget: '', timeline: '' });
                }}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!orderForm.message || !orderForm.contactInfo}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { useDavizClient } from '../hooks/useDavizClient';
import { useWallet } from '@solana/wallet-adapter-react';

export const CreateAssetProfile: React.FC = () => {
  const client = useDavizClient();
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    description: '',
    assetType: '',
    metadataUri: '',
  });

  const assetTypes = [
    { value: 'business', label: 'Business' },
    { value: 'realEstate', label: 'Real Estate' },
    { value: 'intellectual', label: 'Intellectual Property' },
    { value: 'digital', label: 'Digital Asset' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !connected) {
      setResult('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const assetType = { [formData.assetType]: {} };
      const metadataUri = formData.metadataUri.trim() || undefined;

      const { signature, assetProfilePda } = await client.createAssetProfile(
        parseInt(formData.assetId),
        formData.name,
        formData.description,
        assetType,
        metadataUri
      );

      setResult(`✅ Asset Profile Created Successfully!
Asset ID: ${formData.assetId}
Name: ${formData.name}
Type: ${assetTypes.find(t => t.value === formData.assetType)?.label}
PDA: ${assetProfilePda.toString()}
Transaction: ${signature}`);

      // Reset form
      setFormData({
        assetId: '',
        name: '',
        description: '',
        assetType: '',
        metadataUri: '',
      });
    } catch (error) {
      console.error('Error creating asset profile:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to create asset profiles</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Asset Profile (A3)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Asset ID
            </label>
            <input
              type="number"
              required
              value={formData.assetId}
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="Enter unique asset ID"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Asset Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="e.g., ABC Tech Solutions"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Describe your asset or business"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Asset Type
            </label>
            <select
              required
              value={formData.assetType}
              onChange={(e) => setFormData(prev => ({ ...prev, assetType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            >
              <option value="">Select asset type...</option>
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Metadata URI (Optional)
            </label>
            <input
              type="url"
              value={formData.metadataUri}
              onChange={(e) => setFormData(prev => ({ ...prev, metadataUri: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="https://example.com/metadata.json"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to additional asset metadata or documentation
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Asset Profile...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create Asset Profile</span>
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
            <pre className="text-sm whitespace-pre-wrap text-gray-700 font-mono">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
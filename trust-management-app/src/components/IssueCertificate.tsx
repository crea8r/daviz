import React, { useState, useEffect } from 'react';
import { useDavizClient } from '../hooks/useDavizClient';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface TrustFramework {
  publicKey: PublicKey;
  account: {
    authority: PublicKey;
    frameworkId: any;
    name: string;
    description: string;
    criteria: string[];
    isActive: boolean;
  };
}

interface AssetProfile {
  publicKey: PublicKey;
  account: {
    owner: PublicKey;
    assetId: any;
    name: string;
    description: string;
    assetType: any;
    isActive: boolean;
  };
}

export const IssueCertificate: React.FC = () => {
  const client = useDavizClient();
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [result, setResult] = useState<string>('');

  const [frameworks, setFrameworks] = useState<TrustFramework[]>([]);
  const [assets, setAssets] = useState<AssetProfile[]>([]);

  const [formData, setFormData] = useState({
    selectedFramework: '',
    selectedAsset: '',
    trustScore: '',
    evidence: '',
    expirationDate: '',
  });

  // Load frameworks and assets
  useEffect(() => {
    if (client && connected) {
      loadData();
    }
  }, [client, connected]);

  const loadData = async () => {
    if (!client) return;

    setLoadingData(true);
    try {
      const [frameworksData, assetsData] = await Promise.all([
        client.getTrustFrameworks(),
        client.getAssetProfiles(),
      ]);

      setFrameworks(frameworksData.filter(f => f.account.isActive));
      setAssets(assetsData.filter(a => a.account.isActive));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !connected) {
      setResult('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const frameworkPda = new PublicKey(formData.selectedFramework);
      const assetPda = new PublicKey(formData.selectedAsset);
      const trustScore = parseInt(formData.trustScore);
      const expiresAt = formData.expirationDate
        ? Math.floor(new Date(formData.expirationDate).getTime() / 1000)
        : undefined;

      const { signature, trustRecordPda } = await client.issueTrust(
        frameworkPda,
        assetPda,
        trustScore,
        formData.evidence,
        expiresAt
      );

      setResult(`✅ Trust Certificate Issued Successfully!
Trust Score: ${trustScore}/100
Trust Record PDA: ${trustRecordPda.toString()}
Transaction: ${signature}`);

      // Reset form
      setFormData({
        selectedFramework: '',
        selectedAsset: '',
        trustScore: '',
        evidence: '',
        expirationDate: '',
      });
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to issue certificates</p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading frameworks and assets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Issue Trust Certificate (A2)</h2>
        </div>

        {frameworks.length === 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 font-medium">No active trust frameworks found. A1 needs to create frameworks first.</p>
            </div>
          </div>
        )}

        {assets.length === 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 font-medium">No active asset profiles found. A3 needs to create asset profiles first.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Trust Framework
            </label>
            <select
              required
              value={formData.selectedFramework}
              onChange={(e) => setFormData(prev => ({ ...prev, selectedFramework: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            >
              <option value="">Choose a framework...</option>
              {frameworks.map((framework) => (
                <option key={framework.publicKey.toString()} value={framework.publicKey.toString()}>
                  {framework.account.name} (ID: {framework.account.frameworkId.toString()})
                </option>
              ))}
            </select>
          </div>

          {formData.selectedFramework && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl">
            {(() => {
              const selected = frameworks.find(f => f.publicKey.toString() === formData.selectedFramework);
              return selected ? (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Framework Details:</h4>
                  <p className="text-sm text-blue-800 mb-1"><strong>Name:</strong> {selected.account.name}</p>
                  <p className="text-sm text-blue-800 mb-2"><strong>Description:</strong> {selected.account.description}</p>
                  <p className="text-sm text-blue-800 mb-1"><strong>Criteria:</strong></p>
                  <ul className="text-sm text-blue-800 list-disc list-inside">
                    {selected.account.criteria.map((criterion, index) => (
                      <li key={index}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Asset/Business
          </label>
          <select
            required
            value={formData.selectedAsset}
            onChange={(e) => setFormData(prev => ({ ...prev, selectedAsset: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an asset...</option>
            {assets.map((asset) => (
              <option key={asset.publicKey.toString()} value={asset.publicKey.toString()}>
                {asset.account.name} (ID: {asset.account.assetId.toString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trust Score (0-100)
          </label>
          <input
            type="number"
            required
            min="0"
            max="100"
            value={formData.trustScore}
            onChange={(e) => setFormData(prev => ({ ...prev, trustScore: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter trust score"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence/Justification
          </label>
          <textarea
            required
            value={formData.evidence}
            onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed evidence for this trust assessment"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.expirationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

          <button
            type="submit"
            disabled={loading || frameworks.length === 0 || assets.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Issuing Certificate...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Issue Trust Certificate</span>
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
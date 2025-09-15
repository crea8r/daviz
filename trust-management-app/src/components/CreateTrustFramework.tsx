import React, { useState } from 'react';
import { useDavizClient } from '../hooks/useDavizClient';
import { useWallet } from '@solana/wallet-adapter-react';

export const CreateTrustFramework: React.FC = () => {
  const client = useDavizClient();
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const [formData, setFormData] = useState({
    frameworkId: '',
    name: '',
    description: '',
    criteria: [''],
  });

  const handleAddCriteria = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, ''],
    }));
  };

  const handleRemoveCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const handleCriteriaChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((item, i) => i === index ? value : item),
    }));
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
      const validCriteria = formData.criteria.filter(c => c.trim() !== '');

      const { signature, trustFrameworkPda } = await client.createTrustFramework(
        parseInt(formData.frameworkId),
        formData.name,
        formData.description,
        validCriteria
      );

      setResult(`✅ Trust Framework Created Successfully!
Framework ID: ${formData.frameworkId}
PDA: ${trustFrameworkPda.toString()}
Transaction: ${signature}`);

      // Reset form
      setFormData({
        frameworkId: '',
        name: '',
        description: '',
        criteria: [''],
      });
    } catch (error) {
      console.error('Error creating trust framework:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to create trust frameworks</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Trust Framework (A1)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Framework ID
            </label>
            <input
              type="number"
              required
              value={formData.frameworkId}
              onChange={(e) => setFormData(prev => ({ ...prev, frameworkId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="Enter unique framework ID"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Framework Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="e.g., Business Verification Framework"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Describe the purpose and scope of this trust framework"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Trust Criteria
            </label>
          {formData.criteria.map((criteria, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={criteria}
                onChange={(e) => handleCriteriaChange(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder={`Criterion ${index + 1}`}
                maxLength={100}
              />
              {formData.criteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCriteria(index)}
                  className="px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}

            <button
              type="button"
              onClick={handleAddCriteria}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200"
              disabled={formData.criteria.length >= 10}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Criterion</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Framework...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create Trust Framework</span>
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
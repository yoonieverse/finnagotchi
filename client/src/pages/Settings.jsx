import React from 'react';
import { PlaidConnect } from '../components/PlaidConnect';

export const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account preferences and connections</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bank Connection</h2>
            <PlaidConnect />
          </div>

          {/* Other settings sections */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Other Settings</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="text-gray-500">Additional settings can go here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
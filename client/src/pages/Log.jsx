import { useContext } from "react";
import { TransactionContext } from "../contexts/transactionContext";


export function Log() {

    const {transactions} = useContext(TransactionContext);
    console.log(transactions)

    return (
        <div className="page">
          <div className="container-wide">
            {/* Header Section */}
            <div className="page-header">
              <h1 className="page-title">Transaction Log</h1>
              <p className="page-subtitle">View all your financial transactions</p>
            </div>
            
            {/* Summary Stats */}
            {transactions && transactions.length > 0 && (
              <div className="grid grid-4 gap-lg mb-2xl">
                <div className="card card-small text-center">
                  <div className="text-3xl font-bold text-primary">{transactions.length}</div>
                  <div className="text-gray-500">Total Transactions</div>
                </div>
                <div className="card card-small text-center">
                  <div className="text-3xl font-bold text-error">
                    -${transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-gray-500">Total Expenses</div>
                </div>
                <div className="card card-small text-center">
                  <div className="text-3xl font-bold text-success">
                    +${transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toFixed(2)}
                  </div>
                  <div className="text-gray-500">Total Income</div>
                </div>
                <div className="card card-small text-center">
                  <div className="text-3xl font-bold text-accent">
                    ${(transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0) - 
                       transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)).toFixed(2)}
                  </div>
                  <div className="text-gray-500">Net Amount</div>
                </div>
              </div>
            )}
            
            {/* Transactions Grid */}
            <div className="card">
              <h2 className="text-3xl font-semibold text-gray-800 mb-xl">Transaction History</h2>
              {transactions && transactions.length > 0 ? (
                <div className="grid grid-responsive gap-lg">
                  {transactions.map((tx, index) => (
                    <div key={index} className="bg-gradient-card rounded-2xl p-lg hover:shadow-lg transition hover:scale-105" style={{border: '1px solid var(--gray-200)'}}>
                      <div className="flex-between mb-md">
                        <div className="flex gap-md">
                          <div className={`icon ${tx.amount > 0 ? 'icon-error' : 'icon-success'}`}>
                            <span className="text-2xl">
                              {tx.amount > 0 ? '💸' : '💰'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">
                              {tx.name || 'Unknown Transaction'}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {new Date(tx.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${tx.amount > 0 ? 'text-error' : 'text-success'}`}>
                          {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Transaction Details */}
                      <div className="space-y-sm">
                        <div className="flex-between text-sm">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-700">
                            {tx.personal_finance_category?.primary || 'Other'}
                          </span>
                        </div>
                        {tx.merchant_name && (
                          <div className="flex-between text-sm">
                            <span className="text-gray-500">Merchant:</span>
                            <span className="font-medium text-gray-700 truncate ml-2">
                              {tx.merchant_name}
                            </span>
                          </div>
                        )}
                        <div className="flex-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className={`status-indicator ${
                            tx.amount > 0 ? 'status-error' : 'status-success'
                          }`}>
                            {tx.amount > 0 ? 'Expense' : 'Income'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-3xl">
                  <div className="text-8xl mb-lg">📊</div>
                  <h3 className="text-2xl font-bold text-gray-500 mb-md">No transactions available</h3>
                  <p className="text-gray-400 text-lg mb-xl">Connect your bank account to view transactions</p>
                  <div className="inline-flex gap-sm bg-primary-lightest text-primary px-lg py-md rounded-full">
                    <span>💡</span>
                    <span>Go to Plaid page to connect your account</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
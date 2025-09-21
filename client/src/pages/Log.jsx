import { useContext } from "react";
import { TransactionContext } from "../contexts/transactionContext";


export function Log() {

    const {transactions} = useContext(TransactionContext);
    console.log(transactions)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Transaction Log</h1>
              <p className="text-gray-600 text-lg">View all your financial transactions</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Transactions</h2>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">{tx.name || 'Unknown Transaction'}</h3>
                          <p className="text-gray-600 text-sm">{tx.date}</p>
                        </div>
                        <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-xl">No transactions available.</p>
                  <p className="text-gray-400 text-sm mt-2">Connect your bank account to view transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/finance';
import TransactionModal from '@/components/dashboard/widgets/TransactionModal';

export default function FinanceTracker() {
  const { data: session } = useSession();
  const [grandTotal, setGrandTotal] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);

  useEffect(() => {
    fetchTransactions();
    // Simulate system initialization
    setTimeout(() => setIsInitialized(true), 500);
  }, []);

  const fetchTransactions = async () => {
    try {
      setError(null);
      const response = await fetch('/api/finance/transactions');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limit exceeded. Please try again later.');
          setRateLimitResetTime(data.resetTime);
          setRemainingRequests(data.remainingRequests);
          return;
        }
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setGrandTotal(data.grandTotal);
      setRemainingRequests(data.remainingRequests);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to fetch transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (newTransaction: Omit<Transaction, 'id' | 'submittedAt' | 'submittedBy'>) => {
    if (!session?.user?.email) {
      setError('You must be logged in to submit transactions');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limit exceeded. Please try again later.');
          setRateLimitResetTime(data.resetTime);
          setRemainingRequests(data.remainingRequests);
          return;
        }
        throw new Error(data.error || 'Failed to submit transaction');
      }

      setRemainingRequests(data.remainingRequests);
      await fetchTransactions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      setError('Failed to submit transaction. Please try again later.');
    }
  };

  // Format the reset time as a countdown
  const formatResetTime = (resetTime: number) => {
    const now = Date.now();
    const diff = Math.max(0, resetTime - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* System Initialization Overlay */}
      <AnimatePresence>
        {!isInitialized && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 animate-ping">
                <div className="w-32 h-32 rounded-full border-4 border-[rgba(var(--mg-primary),0.3)]" />
              </div>
              <div className="w-32 h-32 rounded-full border-4 border-[rgba(var(--mg-primary),0.8)] animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-md shadow-lg"
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <p className="font-semibold">{error}</p>
                {rateLimitResetTime && (
                  <p className="text-sm mt-1">
                    Reset in: {formatResetTime(rateLimitResetTime)}
                  </p>
                )}
                {remainingRequests !== null && (
                  <p className="text-sm mt-1">
                    Remaining requests: {remainingRequests}
                  </p>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header with Holographic Effect */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mg-panel relative bg-[rgba(var(--mg-panel-dark),0.4)] p-8 rounded-sm overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Scanning line effect */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "linear"
            }}
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(var(--mg-primary), 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(var(--mg-primary), 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} 
          />

          {/* Animated corner decorations */}
          {[0, 90, 180, 270].map((rotation) => (
            <motion.div
              key={rotation}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + rotation/1000 }}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transformOrigin: rotation < 180 ? 'top left' : 'bottom right'
              }}
              className="absolute w-12 h-12"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[rgba(var(--mg-primary),0.8)] to-transparent" />
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[rgba(var(--mg-primary),0.8)] to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Header Content */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center space-x-4"
          >
            {/* Animated icon */}
            <div className="relative w-12 h-12">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="absolute inset-0 border-4 border-[rgba(var(--mg-primary),0.3)] rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                className="absolute inset-2 border-4 border-[rgba(var(--mg-primary),0.5)] rounded-full"
              />
              <div className="absolute inset-4 bg-[rgba(var(--mg-primary),0.2)] rounded-full" />
            </div>

            <div>
              <motion.h1 
                className="mg-title text-3xl mb-2 relative inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                Finance Tracker
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.4 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[rgba(var(--mg-primary),0.8)] via-[rgba(var(--mg-primary),0.3)] to-transparent"
                />
              </motion.h1>
              <motion.p 
                className="text-[rgba(var(--mg-text),0.7)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                Track and manage corporate finances and transactions
              </motion.p>
            </div>
          </motion.div>

          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex items-center space-x-3">
            {['System Active', 'Database Connected', 'Secure Channel'].map((status, index) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 + index * 0.2 }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] animate-pulse" />
                <span className="text-xs text-[rgba(var(--mg-text),0.5)]">{status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Grand Total Display */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="relative min-h-[300px] flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated rings with glowing effects */}
          {[500, 400, 300, 200].map((size, index) => (
            <motion.div
              key={size}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: 1, 
                rotate: index % 2 ? 360 : -360 
              }}
              transition={{
                scale: { delay: 1.4 + index * 0.1, duration: 0.5 },
                rotate: { duration: 10 + index * 2, repeat: Infinity, ease: "linear" }
              }}
              className="absolute"
              style={{
                width: size,
                height: size,
                border: '1px solid',
                borderColor: `rgba(var(--mg-primary),${0.1 + index * 0.05})`,
                borderRadius: '50%',
                boxShadow: `0 0 ${10 + index * 5}px rgba(var(--mg-primary),${0.05 + index * 0.02})`
              }}
            />
          ))}
        </div>

        <motion.div 
          className="mg-panel relative bg-[rgba(var(--mg-panel-dark),0.95)] p-12 rounded-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          {/* Enhanced decorative corners with animations */}
          {[
            'top-0 left-0 origin-top-left',
            'top-0 right-0 origin-top-right',
            'bottom-0 left-0 origin-bottom-left',
            'bottom-0 right-0 origin-bottom-right'
          ].map((position, index) => (
            <motion.div
              key={position}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8 + index * 0.1 }}
              className={`absolute ${position} w-8 h-8 border-2 border-[rgba(var(--mg-primary),0.5)]`}
              style={{
                borderRadius: position.includes('top-0 left-0') ? '8px 0 0 0' :
                           position.includes('top-0 right-0') ? '0 8px 0 0' :
                           position.includes('bottom-0 left-0') ? '0 0 0 8px' :
                           '0 0 8px 0'
              }}
            />
          ))}

          <div className="text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <h2 className="text-[rgba(var(--mg-text),0.7)] text-2xl mb-6">GRAND TOTAL</h2>
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-7xl font-bold"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[rgba(var(--mg-primary),0.8)] via-[rgba(var(--mg-primary),1)] to-[rgba(var(--mg-primary),0.8)]">
                    {grandTotal.toLocaleString()}
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 2.4, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6 }}
                  className="text-2xl mt-4 text-[rgba(var(--mg-text),0.6)]"
                >
                  AUEC
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Holographic data streams */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '-100%', x: `${Math.random() * 100}%`, opacity: 0 }}
                animate={{ 
                  y: '100%', 
                  opacity: [0, 1, 1, 0],
                  x: `${Math.random() * 100}%`
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Create Transaction Button */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.8 }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="mg-button relative px-6 py-3 text-lg flex items-center space-x-2 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.1)] to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Transaction</span>
        </button>
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Transactions List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 }}
        className="mg-panel relative bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.05)] to-transparent" />
          
          {/* Scanning effect */}
          <motion.div
            animate={{
              y: ['0%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.05)] to-transparent"
          />
        </div>
        
        <div className="relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 3.2, duration: 1 }}
          >
            <h2 className="mg-subtitle mb-6 flex items-center">
              <span className="mr-4">Transaction History</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[rgba(var(--mg-primary),0.3)] to-transparent" />
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(var(--mg-primary),0.2)]">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Category</th>
                  <th className="text-left py-2 px-4">Description</th>
                  <th className="text-left py-2 px-4">Submitted By</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[rgba(var(--mg-primary),0.3)] border-t-[rgba(var(--mg-primary),1)]"></div>
                        <span className="text-[rgba(var(--mg-text),0.7)]">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="text-[rgba(var(--mg-text),0.5)] italic">No transactions found</div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction._id || transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.4 + index * 0.1 }}
                      className="border-b border-[rgba(var(--mg-primary),0.1)] hover:bg-[rgba(var(--mg-panel-light),0.1)] transition-colors duration-200"
                    >
                      <td className="py-2 px-4">
                        {new Date(transaction.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`inline-block px-2 py-1 rounded-sm text-xs ${
                          transaction.type === 'DEPOSIT'
                            ? 'bg-[rgba(0,255,0,0.1)] text-[rgba(0,255,0,0.8)]'
                            : 'bg-[rgba(255,0,0,0.1)] text-[rgba(255,0,0,0.8)]'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className={transaction.type === 'DEPOSIT' ? 'text-[rgba(0,255,0,0.8)]' : 'text-[rgba(255,0,0,0.8)]'}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{transaction.amount.toLocaleString()} AUEC
                        </span>
                      </td>
                      <td className="py-2 px-4">{transaction.category.replace('_', ' ')}</td>
                      <td className="py-2 px-4">{transaction.description}</td>
                      <td className="py-2 px-4">{transaction.submittedBy}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
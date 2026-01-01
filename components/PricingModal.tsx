import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: SubscriptionPlan) => void;
  currentPlan: SubscriptionPlan;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade, currentPlan }) => {
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setCheckoutPlan(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (plan: SubscriptionPlan) => {
    setCheckoutPlan(plan);
  };

  const handleBack = () => {
    setCheckoutPlan(null);
  };

  const handleMockPayment = () => {
    if (!checkoutPlan) return;
    
    setIsProcessing(true);
    
    // Simulate network delay for payment processing
    setTimeout(() => {
      onUpgrade(checkoutPlan);
      onClose();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto transition-all duration-300">
        
        {/* Checkout View */}
        {checkoutPlan ? (
          <div className="p-6 md:p-10 relative min-h-[500px] flex flex-col">
            <button 
              onClick={handleBack}
              disabled={isProcessing}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors z-10 flex items-center gap-2 text-stone-600 dark:text-stone-300 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Plans</span>
            </button>

            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors z-10 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>

            <div className="flex flex-col items-center justify-center flex-1 max-w-md mx-auto w-full mt-12">
               <div className="mb-8 text-center">
                 <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Checkout</h2>
                 <p className="text-stone-500 dark:text-stone-400">Complete your secure payment</p>
               </div>

               <div className="w-full bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-700 mb-8">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100 dark:border-stone-700">
                    <span className="font-medium text-stone-600 dark:text-stone-300">Selected Plan</span>
                    <span className="font-bold text-stone-900 dark:text-white capitalize">{checkoutPlan}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-stone-800 dark:text-stone-200">Total</span>
                    <span className="font-extrabold text-teal-600 text-xl">
                      {checkoutPlan === 'monthly' ? '$8.00' : '$180.00'}
                    </span>
                  </div>
               </div>

               {/* Mock Payment Button */}
               <button
                  onClick={handleMockPayment}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
               >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {checkoutPlan === 'monthly' ? '$8.00' : '$180.00'}
                    </>
                  )}
               </button>
               
               <p className="mt-4 text-xs text-stone-500 text-center">
                 This is a demo application. No actual payment will be charged.
               </p>

               <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
                 <ShieldCheck className="w-4 h-4" />
                 <span>Payments are secure and encrypted</span>
               </div>
            </div>
          </div>
        ) : (
          /* Pricing Plans View */
          <div className="p-6 md:p-10 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors z-10"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>

            <div className="text-center mb-6 md:mb-10 mt-2 md:mt-0">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-2 md:mb-3">Upgrade Plant Pal</h2>
              <p className="text-stone-600 dark:text-stone-400 max-w-lg mx-auto text-sm md:text-base">
                Unlock unlimited identifications, advanced diagnoses, and support the growth of our database.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {/* Free Plan */}
              <div className={`relative p-6 rounded-2xl border-2 transition-all ${currentPlan === 'free' ? 'border-stone-300 bg-stone-100 dark:bg-stone-800 dark:border-stone-700' : 'border-stone-200 bg-white dark:bg-stone-800/50 dark:border-stone-700 opacity-75 grayscale'}`}>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Starter
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Free</h3>
                  <div className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">$0</div>
                  <p className="text-xs text-stone-500">Forever</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>3 Identifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Basic Diagnosis</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-400">
                    <X className="w-4 h-4" />
                    <span>Search Grounding</span>
                  </li>
                </ul>
                <button disabled className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-500 font-medium text-sm cursor-default">
                  {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                </button>
              </div>

              {/* Monthly Plan */}
              <div className={`relative p-6 rounded-2xl border-2 transition-all ${currentPlan === 'monthly' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-xl scale-100 md:scale-105 z-10'}`}>
                {currentPlan !== 'monthly' && <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Popular</span>
                </div>}
                <div className="mb-4">
                   <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                    Pro Monthly
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Monthly</h3>
                  <div className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">$8</div>
                  <p className="text-xs text-stone-500">Per Month</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span><strong>Unlimited</strong> Scans</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Advanced Diagnosis</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Google Search Grounding</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelect('monthly')}
                  disabled={currentPlan === 'monthly'}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    currentPlan === 'monthly'
                      ? 'bg-teal-100 text-teal-700 cursor-default'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30'
                  }`}
                >
                  {currentPlan === 'monthly' ? 'Active' : 'Subscribe Monthly'}
                </button>
              </div>

              {/* Lifetime Plan */}
              <div className={`relative p-6 rounded-2xl border-2 transition-all ${currentPlan === 'lifetime' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'}`}>
                <div className="mb-4">
                   <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
                    Best Value
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Lifetime</h3>
                  <div className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">$180</div>
                  <p className="text-xs text-stone-500">One-time payment</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span><strong>Unlimited</strong> Forever</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>Early Access Features</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>All new updates included</span>
                  </li>
                </ul>
                <button 
                   onClick={() => handleSelect('lifetime')}
                   disabled={currentPlan === 'lifetime'}
                   className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    currentPlan === 'lifetime'
                      ? 'bg-amber-100 text-amber-700 cursor-default'
                      : 'bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900'
                  }`}
                >
                  {currentPlan === 'lifetime' ? 'Active' : 'Buy Lifetime'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingModal;
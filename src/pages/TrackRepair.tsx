import { useState } from 'react';
import { Search, Smartphone, CheckCircle, XCircle, ArrowLeft, Wrench } from 'lucide-react';
import { db } from '../services/database';
import { RepairRequest } from '../types';
import { cn } from '../utils/cn';

const repairStatusColors: Record<string, string> = {
  'received': 'bg-blue-500',
  'diagnosing': 'bg-yellow-500',
  'waiting-parts': 'bg-orange-500',
  'in-progress': 'bg-purple-500',
  'completed': 'bg-green-500',
  'returned': 'bg-gray-500',
  'cancelled': 'bg-red-500',
};

const repairStatusLabels: Record<string, string> = {
  'received': 'Received',
  'diagnosing': 'Being Diagnosed',
  'waiting-parts': 'Waiting for Parts',
  'in-progress': 'In Progress',
  'completed': 'Repair Complete',
  'returned': 'Ready for Pickup',
  'cancelled': 'Cancelled',
};

export function TrackRepair() {
  const [repairId, setRepairId] = useState('');
  const [phone, setPhone] = useState('');
  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const result = await db.getRepairByIdAndPhone(repairId.trim(), phone.trim());
      
      if (result) {
        setRepair(result);
      } else {
        setError('Repair not found. Please check your Repair ID and phone number.');
        setRepair(null);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string): number => {
    const steps: Record<string, number> = {
      'received': 1,
      'diagnosing': 2,
      'waiting-parts': 2,
      'in-progress': 3,
      'completed': 4,
      'returned': 5,
      'cancelled': 0,
    };
    return steps[status] || 0;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      {/* Background */}
      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />
      
      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-[#71717a] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3b82f6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Repair</h1>
          <p className="text-[#71717a]">
            Enter your Repair ID and phone number to check the status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Repair ID</label>
              <input
                type="text"
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                placeholder="e.g., REP-X7K9M2"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] uppercase"
              />
            </div>
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 0300-1234567"
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !repairId || !phone}
              className={cn(
                "w-full py-3 px-4 bg-[#3b82f6] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                (loading || !repairId || !phone)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#2563eb] hover:shadow-lg hover:shadow-[#3b82f6]/25"
              )}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Repair
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 flex items-center gap-3 mb-8">
            <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
            <p className="text-[#ef4444]">{error}</p>
          </div>
        )}

        {/* Repair Details */}
        {repair && (
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 animate-fade-in">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#27272a]">
              <div>
                <p className="text-sm text-[#71717a] mb-1">Repair ID</p>
                <p className="text-xl font-mono font-bold text-white">{repair.id}</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  repairStatusColors[repair.status],
                  "text-white"
                )}>
                  {repairStatusLabels[repair.status]}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            {repair.status !== 'cancelled' && (
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-[#27272a] -translate-y-1/2" />
                  <div 
                    className="absolute left-0 top-1/2 h-1 bg-[#3b82f6] -translate-y-1/2 transition-all"
                    style={{ width: `${(getStatusStep(repair.status) / 5) * 100}%` }}
                  />
                  
                  {/* Steps */}
                  {[
                    { step: 1, label: 'Received', icon: Smartphone },
                    { step: 2, label: 'Diagnosing', icon: Search },
                    { step: 3, label: 'In Progress', icon: Wrench },
                    { step: 4, label: 'Completed', icon: CheckCircle },
                    { step: 5, label: 'Ready', icon: CheckCircle },
                  ].map(({ step, label, icon: Icon }) => {
                    const currentStep = getStatusStep(repair.status);
                    const isActive = step <= currentStep;
                    const isCurrent = step === currentStep;
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isActive ? "bg-[#3b82f6]" : "bg-[#18181b] border-2 border-[#27272a]",
                          isCurrent && "ring-4 ring-[#3b82f6]/20"
                        )}>
                          <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[#52525b]")} />
                        </div>
                        <span className={cn(
                          "text-xs mt-2",
                          isActive ? "text-white" : "text-[#52525b]"
                        )}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Device Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#18181b] rounded-lg p-4">
                <p className="text-xs text-[#71717a] mb-1">Device</p>
                <p className="font-medium">{repair.device_brand} {repair.device_model}</p>
              </div>
              <div className="bg-[#18181b] rounded-lg p-4">
                <p className="text-xs text-[#71717a] mb-1">Service Type</p>
                <p className="font-medium">{repair.service_type}</p>
              </div>
            </div>

            {/* Issue Description */}
            <div className="bg-[#18181b] rounded-lg p-4 mb-6">
              <p className="text-xs text-[#71717a] mb-1">Issue Description</p>
              <p className="text-sm">{repair.issue}</p>
            </div>

            {/* Additional Info */}
            {(repair.technician || repair.estimated_cost || repair.notes) && (
              <div className="space-y-3 mb-6 pt-6 border-t border-[#27272a]">
                {repair.technician && (
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Technician</span>
                    <span>{repair.technician}</span>
                  </div>
                )}
                {repair.estimated_cost && (
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Estimated Cost</span>
                    <span className="font-mono">PKR {repair.estimated_cost}</span>
                  </div>
                )}
                {repair.final_cost && (
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Final Cost</span>
                    <span className="font-mono text-[#22c55e]">PKR {repair.final_cost}</span>
                  </div>
                )}
                {repair.notes && (
                  <div className="bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-lg p-3">
                    <p className="text-xs text-[#3b82f6] mb-1">Update from Technician</p>
                    <p className="text-sm">{repair.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-[#52525b] space-y-1 pt-4 border-t border-[#27272a]">
              <p>Submitted: {new Date(repair.created_at).toLocaleString()}</p>
              <p>Last Updated: {new Date(repair.updated_at).toLocaleString()}</p>
              {repair.completed_at && (
                <p className="text-[#22c55e]">Completed: {new Date(repair.completed_at).toLocaleString()}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-6 p-4 bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-lg">
              <p className="text-sm text-center">
                Questions? Contact us at <span className="text-[#3b82f6]">0300-1234567</span>
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!searched && (
          <div className="text-center text-[#52525b] text-sm">
            <p>Enter the Repair ID you received via WhatsApp or SMS</p>
            <p className="mt-2">Example: REP-X7K9M2</p>
          </div>
        )}
      </div>
    </div>
  );
}

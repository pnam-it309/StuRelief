'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, 
  Search, 
  X, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, VerificationStatus, VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_CLASSES, APP_ROUTES } from '@shared';

interface VerificationRequest {
  id: string;
  fullName: string;
  email: string;
  mssv: string;
  campus: string;
  cardImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuthGuard(UserRole.ADMIN);
  const [verifySearch, setVerifySearch] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verifications');
      if (res.ok) {
        const data = await res.json();
        setVerifications(data);
      }
    } catch (err) {
      console.error('Lỗi khi fetch verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentUser) {
      fetchVerifications();
    }
  }, [currentUser]);

  // Handle Verify Actions (Approve/Reject)
  const handleVerifyRequest = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    const confirmed = window.confirm(
      action === 'APPROVED'
        ? 'Xác nhận duyệt yêu cầu xác thực này?'
        : 'Xác nhận từ chối yêu cầu xác thực này?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action }),
      });

      if (res.ok) {
        setVerifications(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
        setSelectedVerification(null);
        showFeedback(action === 'APPROVED' ? 'Duyệt xác thực thành công!' : 'Từ chối xác thực thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      showFeedback('Đã có lỗi xảy ra khi cập nhật trạng thái.', 'error');
    }
  };

  const filteredVerifications = verifications.filter(v => 
    v.fullName.toLowerCase().includes(verifySearch.toLowerCase()) ||
    v.mssv.includes(verifySearch) ||
    v.email.toLowerCase().includes(verifySearch.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <UserCheck className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
        <span className="text-zinc-500 font-medium text-sm">Đang tải phân hệ kiểm duyệt sinh viên...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="approvals" pageTitle="Xác Thực Thẻ Sinh Viên">
      <div className="space-y-3">
        {feedback && (
          <div className={`fixed right-5 top-20 z-50 flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-xl md:top-24 ${
            feedback.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-rose-500 text-white border-rose-400'
          }`}>
            <span className="text-sm font-semibold">{feedback.message}</span>
          </div>
        )}
        


        {/* Content Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold">Xét duyệt thẻ sinh viên & Email trường</h3>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm tên, MSSV, Email..."
                value={verifySearch}
                onChange={(e) => setVerifySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Verifications list table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
                  <th className="py-3 px-4">Sinh viên</th>
                  <th className="py-3 px-4">Mã số sinh viên (MSSV)</th>
                  <th className="py-3 px-4">Cơ sở trường</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredVerifications.map((req) => (
                  <tr key={req.id} className="border-b border-zinc-100 dark:border-zinc-800/40 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/25 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{req.fullName}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{req.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{req.mssv}</td>
                    <td className="py-4 px-4 font-medium text-zinc-500 dark:text-zinc-400">{req.campus}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase ${VERIFICATION_STATUS_CLASSES[req.status as VerificationStatus]}`}>
                        {VERIFICATION_STATUS_LABELS[req.status as VerificationStatus]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedVerification(req)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[11px] cursor-pointer shadow-sm transition-all"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVerifications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-zinc-400">
                      Không tìm thấy yêu cầu xác thực nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STUDENT CARD VERIFICATION MODAL POPUP */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 py-6 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Chi tiết Thẻ Sinh Viên</h3>
              </div>
              <button 
                onClick={() => setSelectedVerification(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Photo Display Card */}
              <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700">
                <img
                  src={selectedVerification.cardImage}
                  alt="Thẻ sinh viên"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Data fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-950 dark:text-zinc-100 font-medium tracking-tight">Họ và tên</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.fullName}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-950 dark:text-zinc-100 font-medium tracking-tight">Mã số sinh viên (MSSV)</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.mssv}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-950 dark:text-zinc-100 font-medium tracking-tight">Email trường cấp</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5 truncate">{selectedVerification.email}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-950 dark:text-zinc-100 font-medium tracking-tight">Cơ sở (Campus)</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.campus}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedVerification.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
                  <button
                    onClick={() => handleVerifyRequest(selectedVerification.id, 'REJECTED')}
                    className="py-3 border border-rose-500/20 hover:bg-rose-500/5 text-rose-500 text-xs font-semibold rounded-2xl cursor-pointer transition-colors"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => handleVerifyRequest(selectedVerification.id, 'APPROVED')}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl cursor-pointer transition-colors shadow-md shadow-blue-500/10"
                  >
                    Duyệt hoạt động
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

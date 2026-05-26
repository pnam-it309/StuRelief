'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Check,
  ShieldCheck,
  Mail,
  IdCard,
  Loader2,
  FileBadge,
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import ImageUpload from '@/components/products/ImageUpload';

interface User {
  id: string;
  email: string;
  status: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [universityEmail, setUniversityEmail] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const emailInputRef = useRef<HTMLInputElement>(null);

  const isAllowedEmail = (value: string) => /@[\w.-]+\.edu\.vn$|@gmail\.com$/i.test(value.trim());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          if (data.user) {
            setUniversityEmail(data.user.email);
          }
        }
      } catch (err) {
        console.error('Lỗi khi fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const clearFieldError = (field: 'email') => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { email?: string } = {};

    if (!universityEmail.trim()) {
      nextErrors.email = 'Vui lòng nhập email trường.';
    } else if (!isAllowedEmail(universityEmail)) {
      nextErrors.email = 'Email phải có đuôi `.edu.vn` hoặc `gmail.com`.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      showFeedback('Vui lòng kiểm tra email trường.', 'error');
      emailInputRef.current?.focus();

      return;
    }

    const confirmed = window.confirm('Xác nhận gửi yêu cầu xác thực sinh viên?');
    if (!confirmed) {
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentCardFront: cardFront,
          studentCardBack: cardBack,
          emailOtp: '123456',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi gửi yêu cầu!');

      showFeedback('Yêu cầu xác thực của bạn đã được gửi và đang chờ quản trị viên duyệt!', 'success');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra!';
      showFeedback(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeItemId="verification" pageTitle="Xác Thực Sinh Viên">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return (
      <DashboardLayout activeItemId="verification" pageTitle="Xác Thực Sinh Viên">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-3xl flex items-center justify-center text-rose-600 mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">Bạn cần đăng nhập</h2>
          <p className="text-zinc-500 max-w-sm mb-8">
            Vui lòng đăng nhập tài khoản sinh viên để thực hiện quy trình xác thực danh tính.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (currentUser.status === 'VERIFIED') {
    return (
      <DashboardLayout activeItemId="verification" pageTitle="Xác Thực Sinh Viên">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 dark:border-emerald-800/50 relative">
            <ShieldCheck className="w-10 h-10" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#0b0f13]">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Bạn đã được xác thực!</h2>
          <p className="text-zinc-500 max-w-md mb-8">
            Tài khoản của bạn đã được quản trị viên phê duyệt. Bây giờ bạn có thể đăng tin bán và thực hiện các giao dịch tin cậy trên hệ thống.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-3 rounded-2xl font-medium active:scale-95 transition-all"
          >
            Quay lại trang chủ
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItemId="verification" pageTitle="Xác Thực Sinh Viên">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {feedback && (
          <div
            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border animate-slide-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <FileBadge className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-xl font-medium mb-4">Quy trình xác thực</h3>
              <ul className="space-y-4">
                {[
                  { step: 1, title: 'Email trường', desc: 'Sử dụng email .edu.vn để đăng ký hoặc cập nhật.' },
                  { step: 2, title: 'Ảnh thẻ SV', desc: 'Chụp rõ nét mặt trước và mặt sau thẻ sinh viên.' },
                  { step: 3, title: 'Duyệt hồ sơ', desc: 'Quản trị viên sẽ phê duyệt trong vòng 24h.' },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium border border-white/30">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{s.title}</h4>
                      <p className="text-[11px] opacity-70 leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Tại sao cần xác thực?
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Để xây dựng một cộng đồng mua bán an toàn, chúng tôi chỉ cho phép những sinh viên đã xác minh danh tính được phép đăng tin bán sản phẩm và tham gia các tính năng nâng cao.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <h3 className="font-medium text-base">Xác minh Email Trường</h3>
                  </div>
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={universityEmail}
                      onChange={(e) => {
                        setUniversityEmail(e.target.value);
                        clearFieldError('email');
                      }}
                      placeholder="mssv@sis.hust.edu.vn"
                      className={`w-full pl-4 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium ${
                        fieldErrors.email ? 'border-rose-500 dark:border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="mt-2 text-[11px] font-semibold text-rose-500">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <h3 className="font-medium text-base">Tải ảnh Thẻ Sinh Viên</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload value={cardFront} onChange={setCardFront} label="Mặt trước thẻ SV" />
                    <ImageUpload value={cardBack} onChange={setCardBack} label="Mặt sau thẻ SV" />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-2xl text-sm shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang gửi hồ sơ...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Gửi yêu cầu xác thực ngay</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center mt-4 px-4 leading-relaxed italic">
                    * Bằng việc nhấn gửi, bạn cam kết các thông tin cung cấp là chính xác và hoàn toàn chịu trách nhiệm về tính trung thực của hồ sơ.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

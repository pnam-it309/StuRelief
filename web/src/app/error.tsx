'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-lg border border-zinc-200 dark:border-zinc-800 animate-scale-up">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          Hệ thống đang được bảo trì!
        </h2>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
          Đã có lỗi xảy ra hoặc hệ thống đang trong quá trình nâng cấp. Xin lỗi bạn vì sự bất tiện này. Vui lòng thử lại sau ít phút!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
            Thử lại
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

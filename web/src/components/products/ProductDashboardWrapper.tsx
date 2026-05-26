'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { AlertCircle, Check, MessageSquare, PackageOpen, X, XCircle } from 'lucide-react';
import { Item } from '@/domain/entities/Item';
import { PRODUCT_STATUS_CLASSES, PRODUCT_STATUS_LABELS } from '@shared';
import ProductCard from './ProductCard';
import SearchAndFilter from './SearchAndFilter';
import ImageUpload from './ImageUpload';
import { aiImageUrl } from '@/lib/aiImage';

interface ProductDashboardWrapperProps {
  initialItems: Item[];
  total: number;
  myTotal: number;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  categories: string[];
  basePath?: string;
  initialTab?: 'all' | 'my';
}

const ITEM_CONDITIONS = [
  { value: 'NEW', label: 'Mới 100%' },
  { value: 'USED_LIKE_NEW', label: 'Như mới' },
  { value: 'USED_GOOD', label: 'Sử dụng tốt' },
  { value: 'USED_FAIR', label: 'Khá' },
  { value: 'USED_POOR', label: 'Cũ' },
];

const ProductDashboardWrapper: React.FC<ProductDashboardWrapperProps> = ({
  initialItems,
  total,
  myTotal,
  page,
  limit,
  search = '',
  category = 'Tất cả danh mục',
  categories,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [totalCount, setTotalCount] = useState(total);
  const [myTotalCount, setMyTotalCount] = useState(myTotal);
  const activeTab = pathname === '/my-posts' ? 'my' : 'all';
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: 'STUDENT' | 'ADMIN'; fullName: string } | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCondition, setFormCondition] = useState('USED_GOOD');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setItems((prev) => {
      const localDrafts = prev.filter((item) => item.status !== 'AVAILABLE');
      const nextItems = [...initialItems];

      localDrafts.forEach((draft) => {
        if (!nextItems.some((item) => item.id === draft.id)) {
          nextItems.unshift(draft);
        }
      });

      return nextItems;
    });
    setTotalCount(total);
    setMyTotalCount(myTotal);
  }, [initialItems, total, myTotal]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (error) {
        console.error('Lỗi khi fetch current user:', error);
      }
    };

    fetchUser();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const displayedItems = activeTab === 'all'
    ? items.filter((item) => item.status === 'AVAILABLE')
    : items;

  const handleOpenCreate = () => {
    if (!currentUser) {
      showFeedback('Bạn cần đăng nhập để đăng tin bán sản phẩm!', 'error');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    setFormName('');
    setFormPrice(0);
    setFormCategory(categories[0] || '');
    setFormDescription('');
    setFormImage('');
    setFormCondition('USED_GOOD');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formName.trim()) {
      showFeedback('Tên sản phẩm không được để trống!', 'error');
      return;
    }

    if (formPrice < 0) {
      showFeedback('Giá sản phẩm không được âm!', 'error');
      return;
    }

    const confirmed = window.confirm('Xác nhận đăng tin bán sản phẩm này?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          price: Number(formPrice),
          category: formCategory,
          description: formDescription,
          images: [formImage || aiImageUrl(`realistic AI student marketplace product photo of ${formName}`, { width: 400, height: 400, seed: formName })],
          studentId: currentUser.id,
          condition: formCondition,
        }),
      });

      if (!response.ok) throw new Error();

      const newProduct = await response.json();
      setItems((prev) => [newProduct, ...prev.filter((item) => item.id !== newProduct.id)]);
      setMyTotalCount((prev) => prev + 1);
      setIsCreateOpen(false);
      showFeedback('Đăng tin thành công, bài đang chờ admin duyệt!');
      router.refresh();
    } catch {
      showFeedback('Đã có lỗi xảy ra khi thêm sản phẩm!', 'error');
    }
  };

  const handleOpenEdit = (product: Item) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(categories.includes(product.category) ? product.category : (categories[0] || ''));
    setFormDescription(product.description || '');
    setFormImage(product.images[0] || '');
    setFormCondition(product.condition || 'USED_GOOD');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!formName.trim()) {
      showFeedback('Tên sản phẩm không được để trống!', 'error');
      return;
    }

    const confirmed = window.confirm('Xác nhận cập nhật tin rao này?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          price: Number(formPrice),
          category: formCategory,
          description: formDescription,
          images: [formImage || aiImageUrl(`realistic AI student marketplace product photo of ${formName}`, { width: 400, height: 400, seed: formName })],
          studentId: selectedProduct.studentId,
          condition: formCondition,
        }),
      });

      if (!response.ok) throw new Error();

      const updatedProduct = await response.json();
      setItems((prev) => prev.map((item) => (item.id === selectedProduct.id ? updatedProduct : item)));

      if (selectedProduct.status === 'AVAILABLE' && updatedProduct.status !== 'AVAILABLE') {
        setTotalCount((prev) => Math.max(0, prev - 1));
      }

      if (selectedProduct.status !== 'AVAILABLE' && updatedProduct.status === 'AVAILABLE') {
        setTotalCount((prev) => prev + 1);
      }

      setIsEditOpen(false);
      showFeedback(updatedProduct.status === 'AVAILABLE'
        ? 'Cập nhật tin rao thành công!'
        : 'Cập nhật tin rao thành công, bài đã chuyển sang chờ duyệt lại!');
      router.refresh();
    } catch {
      showFeedback('Đã có lỗi xảy ra khi sửa sản phẩm!', 'error');
    }
  };

  const handleOpenDelete = async (product: Item) => {
    const confirmed = window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      setItems((prev) => prev.filter((item) => item.id !== product.id));

      if (product.status === 'AVAILABLE') {
        setTotalCount((prev) => Math.max(0, prev - 1));
      }

      if (currentUser && product.studentId === currentUser.id) {
        setMyTotalCount((prev) => Math.max(0, prev - 1));
      }

      window.alert('Xóa sản phẩm thành công!');
      router.refresh();
    } catch {
      window.alert('Đã có lỗi xảy ra khi xóa sản phẩm!');
    }
  };

  const handleOpenDetail = (product: Item) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full">
      {feedback && (
        <div
          className={`fixed top-20 right-5 z-50 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-lg flex items-center gap-3 border transition-all duration-300 animate-slide-in md:top-24 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-rose-500/90 text-white border-rose-400'
          }`}
        >
          <span>{feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</span>
          <span className="font-semibold text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => { if (pathname !== '/') router.push('/'); }}
          className={`pb-4 px-6 text-sm font-medium transition-all relative ${
            activeTab === 'all'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Tất cả tin rao ({totalCount})
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
        </button>
        <button
          onClick={() => {
            if (!currentUser) {
              showFeedback('Bạn cần đăng nhập để xem sản phẩm của tôi!', 'error');
              setTimeout(() => router.push('/login'), 1500);
            } else if (pathname !== '/my-posts') {
              router.push('/my-posts');
            }
          }}
          className={`pb-4 px-6 text-sm font-medium transition-all relative ${
            activeTab === 'my'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Sản phẩm của tôi ({myTotalCount})
          {activeTab === 'my' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
        </button>
      </div>

      <SearchAndFilter
        initialSearch={search}
        initialCategory={category}
        initialLimit={limit}
        onOpenCreateModal={handleOpenCreate}
        categories={categories}
        basePath={pathname}
      />

      {displayedItems.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <PackageOpen className="w-16 h-16 text-zinc-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-1">Không tìm thấy sản phẩm nào</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Hãy thử đổi từ khóa tìm kiếm hoặc đăng bán sản phẩm mới!</p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-2xl text-sm transition-all"
          >
            Đăng bán sản phẩm ngay
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {displayedItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            showActions={pathname === '/my-posts' && (product.studentId === currentUser?.id || currentUser?.role === 'ADMIN')}
          />
        ))}
      </div>

      {mounted && isDetailOpen && selectedProduct && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 py-6 bg-black/60 backdrop-blur-sm transition-all">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto md:grid md:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-64 md:min-h-[560px] w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-6 md:p-8">
              <img
                src={selectedProduct.images[0] || aiImageUrl(`realistic AI student marketplace product photo of ${selectedProduct.name}`, { width: 600, height: 600, seed: selectedProduct.id })}
                alt={selectedProduct.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  {selectedProduct.category}
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full">
                  Tình trạng: {ITEM_CONDITIONS.find(c => c.value === selectedProduct.condition)?.label || 'Không xác định'}
                </span>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${PRODUCT_STATUS_CLASSES[selectedProduct.status]}`}>
                  {PRODUCT_STATUS_LABELS[selectedProduct.status]}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white mb-2 leading-snug">{selectedProduct.name}</h2>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
              </p>
              <hr className="border-zinc-200 dark:border-zinc-800 my-4" />
              <div className="mb-6">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Mô tả chi tiết</h4>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                  {selectedProduct.description || 'Chủ bài đăng không cung cấp mô tả thêm cho sản phẩm này.'}
                </p>
              </div>
              <div className="flex flex-col gap-3 md:pt-2">
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    showFeedback('Đã sao chép thông tin liên hệ của sinh viên!');
                  }}
                  className="flex-1 py-3 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Nhắn tin trao đổi ngay
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl text-sm transition-all"
                >
                  <span className="mr-2 inline-flex align-middle">
                    <XCircle className="h-4 w-4" />
                  </span>
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {mounted && isCreateOpen && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center px-4 pt-20 pb-6 bg-black/60 backdrop-blur-sm transition-all">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[calc(100vh-5rem)] overflow-y-auto md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-500/90 hover:bg-zinc-600 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/40 p-6 md:p-8 md:border-b-0 md:border-r flex flex-col justify-center">
              <div>
                <ImageUpload value={formImage} onChange={setFormImage} />
              </div>
            </div>

            <div className="min-w-0 p-6 md:p-8 flex flex-col justify-center">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">Đăng bán sản phẩm mới</h2>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Giáo trình Triết học Mác-Lênin"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Giá bán (VND) *</label>
                    <input
                      type="text"
                      required
                      value={formPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formPrice)}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        setFormPrice(cleanValue ? Number(cleanValue) : 0);
                      }}
                      placeholder="50.000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Tình trạng *</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    >
                      {ITEM_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Danh mục *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Mô tả thêm</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tình trạng sách, số điện thoại Zalo..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl text-sm transition-all">
                    Đăng tin ngay
                  </button>
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 font-medium rounded-2xl text-sm transition-all">
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}

      {mounted && isEditOpen && selectedProduct && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center px-4 pt-20 pb-6 bg-black/60 backdrop-blur-sm transition-all">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[calc(100vh-5rem)] overflow-y-auto md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-500/90 hover:bg-zinc-600 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/40 p-6 md:p-8 md:border-b-0 md:border-r flex flex-col justify-center">
              <div>
                <ImageUpload value={formImage} onChange={setFormImage} />
              </div>
            </div>

            <div className="min-w-0 p-6 md:p-8 flex flex-col justify-center">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">Chỉnh sửa tin rao</h2>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Giá bán (VND) *</label>
                    <input
                      type="text"
                      required
                      value={formPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formPrice)}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        setFormPrice(cleanValue ? Number(cleanValue) : 0);
                      }}
                      placeholder="50.000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Tình trạng *</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    >
                      {ITEM_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Danh mục *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-950 dark:text-zinc-100 mb-2 tracking-tight">Mô tả thêm</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl text-sm transition-all">
                    Lưu thay đổi
                  </button>
                  <button type="button" onClick={() => setIsEditOpen(false)} className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 font-medium rounded-2xl text-sm transition-all">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default ProductDashboardWrapper;

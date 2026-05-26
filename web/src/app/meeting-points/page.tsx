'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Compass,
  MapPin,
  Navigation2,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { APP_ROUTES } from '@shared';

type MeetingPoint = {
  id: string;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  isSafeZone: boolean;
  campusName: string;
  campusAddress?: string | null;
  universityName: string;
};

type MeetingPointMeta = {
  scope: 'campus' | 'university' | 'all';
  campusName: string | null;
  universityName: string | null;
  totalPoints: number;
  safePoints: number;
  campusCount: number;
};

const SELECTED_POINT_KEY = 'sturelief.selectedMeetingPoint';

export default function MeetingPointsPage() {
  const router = useRouter();
  const { loading } = useAuthGuard();
  const [points, setPoints] = useState<MeetingPoint[]>([]);
  const [meta, setMeta] = useState<MeetingPointMeta | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlySafe, setOnlySafe] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setPageLoading(true);
        const res = await fetch('/api/meeting-points');
        if (!res.ok) return;
        const data = await res.json();
        setPoints(Array.isArray(data.data) ? data.data : []);
        setMeta(data.meta ?? null);
      } catch (error) {
        console.error('Lỗi khi tải điểm hẹn an toàn:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPoints();
  }, []);

  useEffect(() => {
    const savedId = window.localStorage.getItem(SELECTED_POINT_KEY);
    if (savedId) {
      setSelectedPointId(savedId);
    }
  }, []);

  const selectedPoint = useMemo(
    () => points.find((point) => point.id === selectedPointId) || points[0] || null,
    [points, selectedPointId]
  );

  useEffect(() => {
    if (!selectedPoint && points.length > 0) {
      setSelectedPointId(points[0].id);
      window.localStorage.setItem(SELECTED_POINT_KEY, points[0].id);
    }
  }, [points, selectedPoint]);

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      if (onlySafe && !point.isSafeZone) return false;
      const haystack = `${point.name} ${point.campusName} ${point.universityName} ${point.description ?? ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [onlySafe, points, search]);

  const openMap = (point: MeetingPoint) => {
    const query = encodeURIComponent(`${point.name}, ${point.campusName}, ${point.universityName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  const choosePoint = (point: MeetingPoint) => {
    setSelectedPointId(point.id);
    window.localStorage.setItem(SELECTED_POINT_KEY, point.id);
  };

  const scopeLabel =
    meta?.scope === 'campus'
      ? meta.campusName || 'Campus của bạn'
      : meta?.scope === 'university'
        ? meta.universityName || 'Trường của bạn'
        : 'Toàn hệ thống';

  if (loading || pageLoading) {
    return (
      <DashboardLayout activeItemId="meeting-points" pageTitle="Điểm hẹn an toàn">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Route className="h-12 w-12 animate-pulse text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItemId="meeting-points" pageTitle="Điểm hẹn an toàn">
      <div className="mx-auto max-w-6xl space-y-6 px-2 md:px-0">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(APP_ROUTES.HOME)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại chợ đồ cũ</span>
          </button>
          <div className="rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {scopeLabel}
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-blue-500/15 bg-gradient-to-br from-blue-700 via-blue-800 to-cyan-800 p-6 text-white shadow-lg shadow-blue-500/10 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
                Điểm hẹn an toàn cho sinh viên
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="flex items-center gap-3 text-[clamp(1.8rem,3vw,3rem)] font-black leading-none tracking-tight">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                    <MapPin className="h-6 w-6 text-cyan-200" />
                  </span>
                  <span className="whitespace-nowrap">Chọn điểm hẹn</span>
                </h1>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                  <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-semibold text-blue-50">
                    <Zap className="h-4 w-4 text-cyan-200" />
                    Gặp nhanh
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-semibold text-blue-50">
                    <Compass className="h-4 w-4 text-cyan-200" />
                    Giao dịch gọn
                  </span>
                </div>
              </div>

              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
                  <MapPin className="h-4 w-4 text-cyan-200" />
                  {meta?.scope === 'campus' ? 'Theo campus của bạn' : meta?.scope === 'university' ? 'Theo trường của bạn' : 'Theo toàn hệ thống'}
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
                  <Camera className="h-4 w-4 text-cyan-200" />
                  Ưu tiên khu an toàn
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
                  <Navigation2 className="h-4 w-4 text-cyan-200" />
                  Mở bản đồ ngay
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                  <Route className="h-4 w-4" />
                  <span>Tổng điểm</span>
                </div>
                <div className="mt-2 text-2xl font-black">{meta?.totalPoints ?? points.length}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span>An toàn</span>
                </div>
                <div className="mt-2 text-2xl font-black">{meta?.safePoints ?? points.filter((point) => point.isSafeZone).length}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  <span>Campus</span>
                </div>
                <div className="mt-2 text-2xl font-black">{meta?.campusCount ?? new Set(points.map((point) => point.campusName)).size}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên điểm, campus, trường..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-blue-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlySafe((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
              onlySafe
                ? 'bg-blue-600 text-white'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Chỉ điểm an toàn
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            {filteredPoints.map((point) => (
              <article
                key={point.id}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-all dark:bg-zinc-900 ${
                  selectedPoint?.id === point.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-zinc-200/80 hover:-translate-y-0.5 dark:border-zinc-800/60'
                }`}
              >
                <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700">
                  {point.photoUrl ? (
                    <img src={point.photoUrl} alt={point.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <MapPin className="h-12 w-12 text-white/90" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-zinc-900">
                    {point.isSafeZone ? 'An toàn' : 'Công khai'}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400">{point.universityName}</div>
                    <h3 className="mt-1 text-base font-medium text-zinc-950 dark:text-white">{point.name}</h3>
                    <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{point.campusName}</div>
                  </div>

                  <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {point.description || 'Điểm hẹn công khai, dễ tìm và thuận tiện cho giao dịch.'}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-cyan-500" />
                      Khu công khai
                    </span>
                    {point.campusAddress ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        Có địa chỉ
                      </span>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => choosePoint(point)}
                      className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                    >
                      Chọn điểm này
                    </button>
                    <button
                      type="button"
                      onClick={() => openMap(point)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Navigation2 className="h-4 w-4" />
                      Bản đồ
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {filteredPoints.length === 0 && (
              <div className="rounded-3xl border border-dashed border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 lg:col-span-2">
                Không tìm thấy điểm hẹn phù hợp.
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Điểm đã chọn</h3>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>

              {selectedPoint ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                    <div className="text-[11px] font-semibold text-zinc-400">{selectedPoint.universityName}</div>
                    <div className="mt-1 text-base font-medium text-zinc-950 dark:text-white">{selectedPoint.name}</div>
                    <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{selectedPoint.campusName}</div>
                  </div>
                  <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {selectedPoint.description || 'Điểm hẹn phù hợp để giao dịch trực tiếp và an toàn hơn.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => openMap(selectedPoint)}
                    className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    Xem đường đi
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                  Chọn một điểm để xem thông tin chi tiết.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-blue-500/15 bg-blue-50 p-5 shadow-sm dark:border-blue-500/20 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4" />
                <h3 className="text-sm font-medium">Gợi ý</h3>
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Ưu tiên chọn điểm có camera hoặc khu công khai, và mở bản đồ trước khi hẹn gặp.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

import {
  Activity,
  Award,
  ClipboardCheck,
  Compass,
  FileBadge,
  History,
  LucideIcon,
  Map,
  Package2,
  Scale,
  UserCheck,
} from 'lucide-react';
import { APP_ROUTES, UserRole } from '@shared';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const getMenuGroups = (role: UserRole): MenuGroup[] => {
  const userItems = [
    { id: 'catalog', label: 'Chợ đồ cũ sinh viên', icon: Compass, path: APP_ROUTES.HOME },
    ...(role === UserRole.ADMIN
      ? []
      : [
          { id: 'verification', label: 'Xác thực sinh viên', icon: FileBadge, path: APP_ROUTES.VERIFICATION },
          { id: 'my-posts', label: 'Quản lý bài đăng', icon: Package2, path: APP_ROUTES.MY_POSTS },
          { id: 'meeting-points', label: 'Điểm hẹn an toàn', icon: Map, path: APP_ROUTES.MEETING_POINTS },
        ]),
  ];

  const userGroups: MenuGroup[] = [
    {
      title: 'Mua bán & trao đổi',
      items: userItems,
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: 'Hệ thống quản trị',
      items: [
        { id: 'dashboard', label: 'Dashboard tổng quan', icon: Activity, path: APP_ROUTES.ADMIN.DASHBOARD },
        { id: 'approvals', label: 'Xác thực thẻ SV', icon: UserCheck, path: APP_ROUTES.ADMIN.APPROVALS },
        { id: 'posts', label: 'Duyệt bài đăng', icon: ClipboardCheck, path: APP_ROUTES.ADMIN.POSTS },
        { id: 'disputes', label: 'Xử lý vấn đề', icon: Scale, path: APP_ROUTES.ADMIN.DISPUTES },
        { id: 'reputations', label: 'Uy tín & đánh giá', icon: Award, path: APP_ROUTES.ADMIN.REPUTATION },
        { id: 'audit-logs', label: 'Lịch sử hoạt động', icon: History, path: APP_ROUTES.ADMIN.LOGS },
        { id: 'meeting-points', label: 'Điểm hẹn an toàn', icon: Map, path: APP_ROUTES.ADMIN.MEETING_POINTS },
      ],
    },
  ];

  return role === UserRole.ADMIN ? [...userGroups, ...adminGroups] : userGroups;
};

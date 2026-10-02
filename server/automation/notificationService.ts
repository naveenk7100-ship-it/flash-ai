import type { InternalNotification } from '../../src/types/index.ts';

export class NotificationService {
  private notifications: InternalNotification[] = [];

  constructor() {
    this.seedInitialNotifications();
  }

  public getNotifications(): InternalNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public addNotification(
    type: InternalNotification['type'],
    title: string,
    message: string,
    linkTab?: string
  ): InternalNotification {
    const notification: InternalNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab
    };

    this.notifications.unshift(notification);

    // Keep memory capped to past 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    return notification;
  }

  public markAsRead(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
    }
  }

  public markAllAsRead(): void {
    for (const item of this.notifications) {
      item.read = true;
    }
  }

  private seedInitialNotifications(): void {
    this.notifications = [
      {
        id: 'notif-init-1',
        type: 'DAILY_BRIEF_READY',
        title: 'Daily Intelligence Brief Ready',
        message: 'Daily briefing synthesized across 6 observed reels. CPI top performer: AI Tools.',
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'automation'
      },
      {
        id: 'notif-init-2',
        type: 'APPROVAL_REQUIRED',
        title: 'QC Passed • Human Approval Required',
        message: 'New Reels rendered and verified by QC. Ready for human review.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        linkTab: 'approval'
      }
    ];
  }
}

export const notificationService = new NotificationService();

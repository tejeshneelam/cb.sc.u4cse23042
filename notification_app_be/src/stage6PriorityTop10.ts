import axios from 'axios';
import { fileURLToPath } from 'node:url';

type NotificationType = 'Placement' | 'Result' | 'Event';

type RawNotification = Record<string, unknown>;

interface ApiResponse {
    data?: {
        notifications?: RawNotification[];
    };
    notifications?: RawNotification[];
}

export interface PriorityNotification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    isRead: boolean;
}

const NOTIFICATION_API_URL = 'http://20.207.122.201/evaluation-service/notifications';

const TYPE_WEIGHT: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1
};

const normalizeType = (value: unknown): NotificationType | null => {
    const type = String(value || '').toLowerCase();

    if (type === 'placement') return 'Placement';
    if (type === 'result') return 'Result';
    if (type === 'event') return 'Event';
    return null;
};

const readBoolean = (value: unknown) => value === true || value === 'true';

const normalizeNotification = (raw: RawNotification): PriorityNotification | null => {
    const type = normalizeType(raw.type ?? raw.Type ?? raw.notification_type ?? raw.notificationType);
    const id = String(raw.id ?? raw.ID ?? raw.notification_id ?? raw.notificationId ?? '');
    const message = String(raw.message ?? raw.Message ?? '');
    const timestamp = String(raw.timestamp ?? raw.Timestamp ?? raw.created_at ?? raw.createdAt ?? '');

    if (!id || !type || !message || Number.isNaN(Date.parse(timestamp))) {
        return null;
    }

    return {
        id,
        type,
        message,
        timestamp,
        isRead: readBoolean(raw.is_read ?? raw.isRead)
    };
};

export const comparePriority = (a: PriorityNotification, b: PriorityNotification) => {
    const weightDifference = TYPE_WEIGHT[b.type] - TYPE_WEIGHT[a.type];
    if (weightDifference !== 0) return weightDifference;

    return Date.parse(b.timestamp) - Date.parse(a.timestamp);
};

export const getTopPriorityNotifications = async (
    authToken: string,
    topN = 10,
    fetchLimit = 100
) => {
    const response = await axios.get<ApiResponse>(NOTIFICATION_API_URL, {
        headers: { Authorization: authToken },
        params: { limit: fetchLimit }
    });

    const rawNotifications = response.data.data?.notifications ?? response.data.notifications ?? [];

    return rawNotifications
        .map(normalizeNotification)
        .filter((notification): notification is PriorityNotification => Boolean(notification))
        .filter(notification => !notification.isRead)
        .sort(comparePriority)
        .slice(0, topN);
};

export class TopPriorityWindow {
    private readonly maxSize: number;
    private notifications: PriorityNotification[] = [];

    constructor(maxSize = 10) {
        this.maxSize = maxSize;
    }

    upsert(notification: PriorityNotification) {
        this.notifications = this.notifications.filter(item => item.id !== notification.id);

        if (notification.isRead) {
            return;
        }

        if (this.notifications.length < this.maxSize) {
            this.notifications.push(notification);
            this.notifications.sort(comparePriority);
            return;
        }

        const lowestPriorityItem = this.notifications[this.notifications.length - 1];
        if (comparePriority(notification, lowestPriorityItem) < 0) {
            this.notifications[this.notifications.length - 1] = notification;
            this.notifications.sort(comparePriority);
        }
    }

    list() {
        return [...this.notifications].sort(comparePriority);
    }
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const rawToken = process.env.AFFORDMED_TOKEN || 'Bearer DUMMY';
    const authToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

    getTopPriorityNotifications(authToken)
        .then(notifications => {
            console.table(notifications.map((notification, index) => ({
                rank: index + 1,
                type: notification.type,
                message: notification.message,
                timestamp: notification.timestamp
            })));
        })
        .catch(error => {
            console.error(getErrorMessage(error));
            process.exitCode = 1;
        });
}

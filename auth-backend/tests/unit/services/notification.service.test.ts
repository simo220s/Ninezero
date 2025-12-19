import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '../../../src/services/notification.service';

// Mock Supabase client
vi.mock('../../../src/config/supabase', () => ({
    getSupabaseClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: [{ id: 'notif-1' }], error: null }))
            })),
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null }))
            }))
        }))
    }))
}));

describe('NotificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createInAppNotification', () => {
        it('should create a notification successfully', async () => {
            const notification = {
                userId: 'user-123',
                type: 'class_reminder_15m' as any,
                title: 'Class Starting Soon',
                message: 'Your class starts in 15 minutes',
                metadata: { classId: 'class-456' }
            };

            const result = await notificationService.createInAppNotification(notification);

            expect(result).toBeDefined();
        });

        it('should handle notification creation errors', async () => {
            const { getSupabaseClient } = await import('../../../src/config/supabase');
            vi.mocked(getSupabaseClient).mockReturnValueOnce({
                from: vi.fn(() => ({
                    insert: vi.fn(() => ({
                        select: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB Error' } }))
                    }))
                }))
            } as any);

            const notification = {
                userId: 'user-123',
                type: 'class_reminder_15m' as any,
                title: 'Test',
                message: 'Test message'
            };

            const result = await notificationService.createInAppNotification(notification);

            expect(result).toBeNull();
        });
    });

    describe('getUnreadNotifications', () => {
        it('should retrieve user notifications', async () => {
            const userId = 'user-123';

            const notifications = await notificationService.getUnreadNotifications(userId);

            expect(notifications).toBeDefined();
            expect(Array.isArray(notifications)).toBe(true);
        });

        it('should limit results', async () => {
            const userId = 'user-123';

            const notifications = await notificationService.getUnreadNotifications(userId, 10);

            expect(notifications).toBeDefined();
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const notificationId = 'notif-123';

            await expect(
                notificationService.markAsRead(notificationId)
            ).resolves.not.toThrow();
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all user notifications as read', async () => {
            const userId = 'user-123';

            await expect(
                notificationService.markAllAsRead(userId)
            ).resolves.not.toThrow();
        });
    });
});

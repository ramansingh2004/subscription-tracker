'use client';

import { useNotifications } from '@/lib/hooks';
import { useState } from 'react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { EmptyState } from '@/components/shared/EmptyState';

export default function NotificationsContent() {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await apiClient.delete(`/notifications/${id}`);
      toast.success('Notification deleted');
      // Refetch would happen automatically via query invalidation
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
      toast.success('Marked as read');
    }
  };

  // Handle loading state with suspense - this shouldn't happen but as fallback
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-2">
              You have <span className="font-bold text-blue-600">{unreadCount}</span> unread{' '}
              notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 flex-wrap">
        {['all', 'unread', 'read'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : 'Read'}
            {tab === 'all' && ` (${notifications.length})`}
            {tab === 'unread' && ` (${unreadCount})`}
            {tab === 'read' &&
              ` (${notifications.filter((n) => n.read).length})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={`No ${filter !== 'all' ? filter : ''} Notifications`}
          description={
            filter === 'all'
              ? 'You are all caught up!'
              : filter === 'unread'
                ? 'No unread notifications'
                : 'No read notifications yet'
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-lg border-l-4 transition ${
                notif.read
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-600'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title and Badge */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {notif.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        notif.type === 'renewal'
                          ? 'bg-blue-200 text-blue-800'
                          : notif.type === 'recommendation'
                            ? 'bg-green-200 text-green-800'
                            : notif.type === 'report'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-orange-200 text-orange-800'
                      }`}
                    >
                      {notif.type === 'renewal'
                        ? '🔄 Renewal'
                        : notif.type === 'recommendation'
                          ? '💡 Suggestion'
                          : notif.type === 'report'
                            ? '📊 Report'
                            : '📤 Share'}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 mb-2 line-clamp-2">{notif.message}</p>

                  {/* Timestamp */}
                  <p className="text-sm text-gray-600">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id, notif.read)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition font-medium whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    disabled={deletingId === notif._id}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition font-medium whitespace-nowrap"
                  >
                    {deletingId === notif._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg border border-gray-300">
          <div>
            <p className="text-sm text-gray-600">Total Notifications</p>
            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unread</p>
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Read</p>
            <p className="text-2xl font-bold text-gray-600">
              {notifications.filter((n) => n.read).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
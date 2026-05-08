'use client';

import { useNotifications } from '@/lib/hooks';
import { useState } from 'react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

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
              You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notifications
            </p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4">
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-lg border-l-4 ${
                notif.read
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {notif.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      notif.type === 'reminder'
                        ? 'bg-blue-200 text-blue-800'
                        : notif.type === 'alert'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{notif.message}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id, notif.read)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
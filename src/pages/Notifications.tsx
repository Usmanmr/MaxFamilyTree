import { useState } from 'react';
import { Bell, Check, Users, ImageIcon, Edit2 } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { toast } from '../components/ui/Toast';

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'person_added',
      title: 'New relative added',
      body: 'John Smith was added to your shared tree "Smith Family Tree".',
      time: '2 hours ago',
      read: false,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'photo_added',
      title: 'New photos uploaded',
      body: '3 new photos were added to Jane Doe\'s profile.',
      time: 'Yesterday',
      read: false,
      icon: ImageIcon,
      color: 'text-pink-500',
      bg: 'bg-pink-50'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      body: 'We just released the new infinite canvas update! Try it out now.',
      time: '3 days ago',
      read: true,
      icon: Bell,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    }
  ]);

  const displayedNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMarkRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated on your family tree activity</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg transition"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'all' ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'unread' ? 'border-[#e76f2f] text-[#e76f2f]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Unread
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="ml-2 bg-[#e76f2f] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map(notification => (
            <div 
              key={notification.id} 
              onClick={() => handleMarkRead(notification.id)}
              className={`p-5 flex gap-4 transition cursor-pointer relative hover:bg-slate-50 ${!notification.read ? 'bg-[#f8fbff]' : ''}`}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              )}
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.bg} ${notification.color}`}>
                <notification.icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-slate-400">{notification.time}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{notification.body}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12">
            <EmptyState
              illustration={
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-slate-200/50">
                  <Bell className="w-10 h-10 text-slate-300" />
                </div>
              }
              title="You're all caught up! 🎉"
              description="You have no new notifications right now. We'll let you know when something happens."
            />
          </div>
        )}
      </div>

    </div>
  );
}

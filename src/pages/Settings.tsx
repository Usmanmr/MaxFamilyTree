import { useState, useEffect } from 'react';
import { toast } from '../components/ui/Toast';
import AvatarImage from '../components/ui/AvatarImage';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName });
      toast.success('Profile updated in Cloud SQL');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-8 flex gap-8">
      {/* Sidebar Tabs */}
      <div className="w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>
        <div className="flex flex-col gap-1">
          {['profile', 'notifications', 'session'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-orange-50 text-[#e76f2f]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8">
        {activeTab === 'profile' && (
          <div className="max-w-xl space-y-8 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
              Public Profile
            </h2>

            <div className="flex gap-6 items-center">
              <AvatarImage
                name={user ? `${user.firstName} ${user.lastName}` : 'User'}
                src={user?.avatarUrl}
                size="lg"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#e76f2f] focus:border-[#e76f2f] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#e76f2f] focus:border-[#e76f2f] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#e76f2f] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#d4621f] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-xl space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
              Notifications
            </h2>

            <div className="space-y-4">
              {[
                'New family member added to my tree by a collaborator',
                'Someone uploads a photo to a shared tree',
                'Weekly digest of family history discoveries',
                'Product updates and announcements',
              ].map((label, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={i < 2}
                    className="mt-1 rounded text-[#e76f2f] focus:ring-[#e76f2f] w-4 h-4 border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'session' && (
          <div className="max-w-xl space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
              Account Session
            </h2>
            <p className="text-sm text-slate-600">
              You are currently signed in via Google Authentication as{' '}
              <span className="font-semibold text-slate-800">{user?.email}</span>.
            </p>
            <button
              onClick={() => logout()}
              className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

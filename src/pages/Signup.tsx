import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Account connected! Welcome to FamilyTree.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-Up failed:', error);
      toast.error(error?.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#e76f2f] flex items-center justify-center shadow-lg shadow-[#e76f2f]/20">
            <Network className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign up with Google to start building and exploring your family heritage
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[500px]">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12.24 10.285V14.4h6.806c-.275 1.565-1.06 2.812-1.996 3.69-1.127 1.135-2.91 2.404-4.81 2.404-3.844 0-6.936-3.21-6.936-7.146 0-3.934 3.092-7.145 6.935-7.145 2.126 0 3.86.837 5.176 1.995l2.766-2.89C18.256 3.518 15.652 2 12.238 2 6.577 2 2 6.643 2 13.348c0 6.706 4.577 11.348 10.238 11.348 3.125 0 5.645-1.037 7.555-3.084 2.128-2.222 2.766-5.362 2.766-7.857 0-.585-.06-1.16-.145-1.47H12.24z"
              />
            </svg>
            {loading ? 'Connecting account...' : 'Sign up with Google'}
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-medium text-[#e76f2f] hover:text-[#d4621f]">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Store, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shopName, setShopName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        // --- SIGNUP FLOW ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            shopName,
            whatsappNumber,
            metaPhoneId
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Auto-login after signup
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-300/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-200/25 blur-[120px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link href="/">
            <div className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center shadow-md border border-neutral-800 cursor-pointer">
              <Store className="h-8 w-8 text-white" />
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          {isLogin ? 'Welcome Back' : 'Start Your Empire'}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-550">
          {isLogin ? 'Enter your vault credentials' : 'Join the elite club of automated jewelers'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-neutral-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-550/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/20">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Brand Name</label>
                  <input
                    type="text" required={!isLogin}
                    value={shopName} onChange={(e) => setShopName(e.target.value)}
                    className="mt-1 block w-full bg-white border border-neutral-300 rounded-lg shadow-sm py-2 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                    placeholder="e.g. Royal Diamonds"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">WhatsApp Business Number</label>
                  <input
                    type="text" required={!isLogin}
                    value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="mt-1 block w-full bg-white border border-neutral-300 rounded-lg shadow-sm py-2 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                    placeholder="919876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Meta Phone Number ID <span className="text-neutral-500 text-xs">(Optional)</span></label>
                  <input
                    type="text"
                    value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)}
                    className="mt-1 block w-full bg-white border border-neutral-300 rounded-lg shadow-sm py-2 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                    placeholder="e.g. 1048382945"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Provided by Admin after Meta setup.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700">Email Address</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-white border border-neutral-300 rounded-lg shadow-sm py-2 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                placeholder="owner@jewelry.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Secret Vault Key (Password)</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-white border border-neutral-300 rounded-lg shadow-sm py-2 pl-3 pr-10 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-black hover:bg-neutral-800 focus:outline-none transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : isLogin ? 'Access Vault' : (
                  <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Forge My Empire</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-neutral-700 hover:text-black font-semibold transition-colors cursor-pointer"
            >
              {isLogin ? "New to the elite? Apply here" : "Already a member? Enter Vault"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

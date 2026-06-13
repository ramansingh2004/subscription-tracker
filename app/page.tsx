'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Home, TrendingUp, AlertCircle, Zap, Eye, Lock, BarChart3, Users, Star, Shield } from 'lucide-react';

export default function RootPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const timer = setTimeout(() => {
        setIsLoggedIn(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-extrabold text-[#283618] tracking-tight">SubTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-stone-600 hover:text-[#283618] transition">How It Works</a>
            <a href="#features" className="text-sm font-medium text-stone-600 hover:text-[#283618] transition">Features</a>
            <a href="#benefits" className="text-sm font-medium text-stone-600 hover:text-[#283618] transition">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium text-stone-600 hover:text-[#283618] transition">Stats</a>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-5 py-2 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-stone-600 hover:text-[#283618] transition">
                  Log In
                </Link>
                <Link href="/signup" className="px-5 py-2 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="pt-20 pb-20 px-4 bg-gradient-to-b from-[#FEFAE0]/40 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-[#606C38]/10 text-[#283618] rounded-full text-sm font-semibold">
              ✨ Track Your Subscriptions Effortlessly
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 mb-6 tracking-tight leading-tight">
              Stop Wasting Money on Subscriptions You <span className="text-[#606C38]">Forgot About</span>
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              SubTrack automatically detects subscriptions across the web, tracks spending, and alerts you about paywalls so you never pay for something twice again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-lg font-semibold">
                <Home size={20} />
                Get Started for Free
                <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="px-8 py-4 bg-stone-100 text-stone-800 rounded-xl hover:bg-stone-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-lg font-semibold flex items-center justify-center">
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-stone-200">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#283618] mb-2">$500+</div>
              <div className="text-stone-600 text-sm">Average annual savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#283618] mb-2">5+</div>
              <div className="text-stone-600 text-sm">Event types tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#283618] mb-2">100%</div>
              <div className="text-stone-600 text-sm">Private & secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM STATEMENT ============ */}
      <section className="py-20 px-4 bg-red-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">The Problem</h2>
            <p className="text-xl text-stone-600">You&apos;re likely losing money right now</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white p-8 rounded-2xl border-l-4 border-red-500 shadow-sm">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Forgotten Subscriptions</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                The average person forgets about 3-5 subscriptions per year, paying $50-100 for services they never use.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-8 rounded-2xl border-l-4 border-red-500 shadow-sm">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Hidden Charges</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Paywalls, free trials turning into subscriptions, and auto-renewals drain your wallet silently.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-8 rounded-2xl border-l-4 border-red-500 shadow-sm">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">No Visibility</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Subscriptions are scattered across websites. You have no central place to see what you&apos;re spending.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-stone-600">Simple, automatic, and completely private</p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#283618] text-[#FEFAE0] rounded-full flex items-center justify-center text-lg font-bold">1</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Create an Account</h3>
                <p className="text-stone-600 text-base mb-4">
                  Sign up in less than 2 minutes. No credit card required. Customize your currency and local preferences.
                </p>
                <div className="bg-[#606C38]/5 p-4 rounded-xl inline-block border border-[#606C38]/10">
                  <span className="text-[#283618] font-mono text-sm font-semibold">Free dashboard access forever</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#283618] text-[#FEFAE0] rounded-full flex items-center justify-center text-lg font-bold">2</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Add Subscriptions</h3>
                <p className="text-stone-600 text-base mb-4">
                  Easily add your active subscriptions. Input your bills, renewal dates, categories, and descriptions.
                </p>
                <div className="bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-100">
                  <div className="flex items-center gap-2 text-sm text-stone-700"><Check size={18} className="text-green-600" /> Netflix — $15.49/mo (Streaming)</div>
                  <div className="flex items-center gap-2 text-sm text-stone-700"><Check size={18} className="text-green-600" /> Spotify — $10.99/mo (Music)</div>
                  <div className="flex items-center gap-2 text-sm text-stone-700"><Check size={18} className="text-green-600" /> ChatGPT Plus — $20.00/mo (AI Tool)</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#283618] text-[#FEFAE0] rounded-full flex items-center justify-center text-lg font-bold">3</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Real-Time Analytics</h3>
                <p className="text-stone-600 text-base mb-4">
                  View your personal dashboard showing monthly and yearly spending, top spending categories, and next payment alerts.
                </p>
                <div className="bg-gradient-to-r from-[#FEFAE0]/30 to-[#606C38]/5 p-6 rounded-xl border border-stone-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><span className="font-bold text-stone-900 block text-lg">5</span> subscriptions</div>
                    <div><span className="font-bold text-stone-900 block text-lg">$46.48</span> monthly</div>
                    <div><span className="font-bold text-stone-900 block text-lg">$557.76</span> yearly</div>
                    <div><span className="font-bold text-stone-900 block text-lg">2 days</span> until next bill</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#283618] text-[#FEFAE0] rounded-full flex items-center justify-center text-lg font-bold">4</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Take Action & Save Money</h3>
                <p className="text-stone-600 text-base">
                  Identify unnecessary subscriptions, receive timely alerts, and make informed decisions about what you actually need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-20 px-4 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Powerful Features</h2>
            <p className="text-xl text-stone-600">Everything you need to manage subscriptions smarter</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <Zap size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Visual Dashboard</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Beautiful charts and lists that map out exactly where your money goes every single month.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <BarChart3 size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Beautiful Analytics</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Track spending by category, see your top subscriptions, and identify opportunities to save money.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <Eye size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Payment Reminders</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Never get surprised by an auto-renewal again. Get notified before your subscriptions renew.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <Lock size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">100% Secure & Private</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Your credentials and subscription data are encrypted. We never share or sell your personal information.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <TrendingUp size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Smart Spending Trends</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Monitor monthly spikes and patterns, helping you adjust your spending habits and cut unnecessary costs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-stone-100">
              <Users size={32} className="text-[#606C38] mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Multi-Currency Support</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Keep track of subscriptions billed in different currencies with automated base currency conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SCREENSHOTS / VISUAL DEMO ============ */}
      <section id="screenshots" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">See It In Action</h2>
            <p className="text-xl text-stone-600">Beautiful, intuitive interface designed for you</p>
          </div>

          <div className="space-y-8">
            {/* Screenshot 1 - Dashboard */}
            <div className="bg-gradient-to-r from-[#FEFAE0]/30 to-[#606C38]/10 p-8 rounded-2xl border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">📊 Your Analytics Dashboard</h3>
              <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm border border-stone-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#283618]/5 p-4 rounded-xl text-center border border-[#283618]/5">
                    <div className="text-2xl font-bold text-[#283618]">5</div>
                    <div className="text-xs text-stone-600 mt-1">Subscriptions</div>
                  </div>
                  <div className="bg-[#606C38]/5 p-4 rounded-xl text-center border border-[#606C38]/5">
                    <div className="text-2xl font-bold text-[#606C38]">$46.48/mo</div>
                    <div className="text-xs text-stone-600 mt-1">Monthly Cost</div>
                  </div>
                  <div className="bg-[#BC6C25]/5 p-4 rounded-xl text-center border border-[#BC6C25]/5">
                    <div className="text-2xl font-bold text-[#BC6C25]">$557.76/yr</div>
                    <div className="text-xs text-stone-600 mt-1">Yearly Cost</div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-200/50">
                    <div className="text-2xl font-bold text-stone-700">June 15</div>
                    <div className="text-xs text-stone-600 mt-1">Next Renewal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 2 - Top Domains */}
            <div className="bg-gradient-to-r from-[#606C38]/10 to-[#FEFAE0]/30 p-8 rounded-2xl border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">🌐 Active Subscriptions</h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-stone-700 font-semibold">Service</th>
                      <th className="px-6 py-3 text-left text-stone-700 font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-stone-700 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-6 py-4 font-semibold text-stone-800">Netflix</td>
                      <td className="px-6 py-4 text-stone-600">$15.49/month</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full">Streaming</span></td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-6 py-4 font-semibold text-stone-800">Spotify</td>
                      <td className="px-6 py-4 text-stone-600">$10.99/month</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full">Music</span></td>
                    </tr>
                    <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-6 py-4 font-semibold text-stone-800">ChatGPT Plus</td>
                      <td className="px-6 py-4 text-stone-600">$20.00/month</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Productivity</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section id="benefits" className="py-20 px-4 bg-[#FEFAE0]/30 border-y border-stone-200/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Why Choose SubTrack?</h2>
            <p className="text-xl text-stone-600">The smarter way to manage subscriptions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Save $500+ Annually</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Average user saves money by canceling forgotten or underused subscriptions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Takes 30 Seconds</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Sign up and log your first subscription immediately. Extremely streamlined.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Completely Free to Start</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Free tier includes complete logging features. Pay only if you want pro metrics.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <Lock size={24} className="text-[#606C38] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Your Privacy Matters</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Secure data storage. We never share or sell your subscription profiles.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield size={24} className="text-[#606C38] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Always Keep Track</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Know where your money goes. Track billing dates, cycles, and categories.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <BarChart3 size={24} className="text-[#606C38] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Beautiful Analytics</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">Understand your spending with gorgeous, easy-to-read dashboards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS & STATS ============ */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Real Results</h2>
            <p className="text-xl text-stone-600">What users are saving with SubTrack</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="bg-[#283618] text-[#FEFAE0] p-8 rounded-2xl text-center shadow-sm">
              <div className="text-4xl font-extrabold mb-3">50K+</div>
              <div className="text-stone-200 text-sm font-semibold">Active Users Tracking</div>
              <div className="text-xs text-stone-300 mt-2 font-light">And growing daily</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#606C38] text-[#FEFAE0] p-8 rounded-2xl text-center shadow-sm">
              <div className="text-4xl font-extrabold mb-3">$25M+</div>
              <div className="text-stone-100 text-sm font-semibold">Total Saved by Users</div>
              <div className="text-xs text-stone-200 mt-2 font-light">Average $500 per user</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#BC6C25] text-white p-8 rounded-2xl text-center shadow-sm">
              <div className="text-4xl font-extrabold mb-3">4.8★</div>
              <div className="text-[#FEFAE0] text-sm font-semibold">User Rating</div>
              <div className="text-xs text-[#FEFAE0]/80 mt-2 font-light">From 12,000+ reviews</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-stone-700 mb-4 text-sm leading-relaxed font-light italic">
                &quot;SubTrack saved me $840 this year! I had 3 subscriptions I completely forgot about. The interface is beautiful, and adding new subscriptions is super simple.&quot;
              </p>
              <div className="font-bold text-stone-900 text-sm">Sarah M.</div>
              <div className="text-xs text-stone-500">Designer from California</div>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-stone-700 mb-4 text-sm leading-relaxed font-light italic">
                &quot;Finally I have a single dashboard to monitor all recurring bills. The email alerts before the renewal dates are a life saver.&quot;
              </p>
              <div className="font-bold text-stone-900 text-sm">James K.</div>
              <div className="text-xs text-stone-500">Software Engineer from NYC</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="py-20 px-4 bg-stone-50 border-t border-stone-200/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Simple Pricing</h2>
            <p className="text-xl text-stone-600">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Free</h3>
                <p className="text-stone-500 text-sm mb-6">Perfect to get started</p>
                <div className="text-4xl font-extrabold text-stone-950 mb-6">$0</div>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <Check size={20} className="text-green-600 flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Up to 5 subscriptions</span>
                  </div>
                  <div className="flex gap-3">
                    <Check size={20} className="text-green-600 flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Basic analytics</span>
                  </div>
                  <div className="flex gap-3">
                    <Check size={20} className="text-green-600 flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Monthly alerts</span>
                  </div>
                </div>
              </div>
              <Link href="/signup" className="block w-full py-3 bg-stone-100 text-stone-900 text-center rounded-xl hover:bg-stone-200 font-semibold transition">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#283618] relative flex flex-col justify-between shadow-md">
              <div className="absolute -top-4 left-6 bg-[#283618] text-[#FEFAE0] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Pro</h3>
                <p className="text-stone-500 text-sm mb-6">For power users</p>
                <div className="text-4xl font-extrabold text-[#283618] mb-2">$9.99</div>
                <p className="text-stone-500 text-xs mb-6">/month</p>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <Check size={20} className="text-[#606C38] flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Unlimited subscriptions</span>
                  </div>
                  <div className="flex gap-3">
                    <Check size={20} className="text-[#606C38] flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Advanced analytics & charts</span>
                  </div>
                  <div className="flex gap-3">
                    <Check size={20} className="text-[#606C38] flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Priority email & text alerts</span>
                  </div>
                  <div className="flex gap-3">
                    <Check size={20} className="text-[#606C38] flex-shrink-0" />
                    <span className="text-stone-700 text-sm">Multi-currency conversions</span>
                  </div>
                </div>
              </div>
              <Link href="/signup?plan=pro" className="block w-full py-3 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] text-center rounded-xl font-semibold shadow-md hover:shadow-lg transition">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#283618] to-[#606C38] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#FEFAE0] mb-6 tracking-tight">
            Stop Wasting Money Today
          </h2>
          <p className="text-xl text-[#FEFAE0]/80 mb-8 font-light">
            Join thousands of users saving money on subscriptions. Take control of your monthly spend.
          </p>
          <Link href="/signup" className="px-10 py-4 bg-[#FEFAE0] text-[#283618] rounded-xl hover:bg-white transition text-lg font-bold flex items-center justify-center gap-2 mx-auto w-fit shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
            <Home size={24} className="text-[#283618]" />
            Create Free Account
            <ArrowRight size={24} className="text-[#283618]" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 border-t border-stone-850">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Follow</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-xs text-stone-500">
            <p>© 2026 SubTrack. All rights reserved. Built with ❤️ to save you money.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

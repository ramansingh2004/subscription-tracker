'use client';

import { ArrowRight, Check, Home, TrendingUp, AlertCircle, Zap, Eye, Lock, BarChart3, Users, Star, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-gray-900">SubTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Stats</a>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="pt-20 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              ✨ Track Your Subscriptions Effortlessly
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Wasting Money on Subscriptions You <span className="text-blue-600">Forgot About</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              SubTrack automatically detects subscriptions across the web, tracks spending, and alerts you about paywalls so you never pay for something twice again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg font-medium">
                <Home size={20} />
                Install Extension - FREE
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition text-lg font-medium">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">$500+</div>
              <div className="text-gray-600">Average annual savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">5+</div>
              <div className="text-gray-600">Event types tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">Private & secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM STATEMENT ============ */}
      <section className="py-20 px-4 bg-red-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-xl text-gray-600">You&apos;re likely losing money right now</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white p-8 rounded-lg border-l-4 border-red-500">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Forgotten Subscriptions</h3>
              <p className="text-gray-600">
                The average person forgets about 3-5 subscriptions per year, paying $50-100 for services they never use.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-8 rounded-lg border-l-4 border-red-500">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hidden Charges</h3>
              <p className="text-gray-600">
                Paywalls, free trials turning into subscriptions, and auto-renewals drain your wallet silently.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-8 rounded-lg border-l-4 border-red-500">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Visibility</h3>
              <p className="text-gray-600">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, automatic, and completely private</p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Install the Browser Extension</h3>
                <p className="text-gray-600 text-lg mb-4">
                  Click install to add SubTrack to your Chrome browser. Takes 30 seconds. No credit card required.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg inline-block">
                  <code className="text-blue-700 font-mono">Free for 7 days, then $0 if you don&apos;t need Pro</code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Automatic Detection</h3>
                <p className="text-gray-600 text-lg mb-4">
                  As you browse, SubTrack silently detects subscriptions, paywalls, and ads. No action needed from you.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2"><Check size={18} className="text-green-600" /> Detected Netflix on Netflix.com</div>
                  <div className="flex items-center gap-2"><Check size={18} className="text-green-600" /> Found paywall on NYTimes.com</div>
                  <div className="flex items-center gap-2"><Check size={18} className="text-green-600" /> Spotted ads on Blog.example.com</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Analytics</h3>
                <p className="text-gray-600 text-lg mb-4">
                  View your personal dashboard showing spending, top domains, paywalls found, and subscription opportunities.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-gray-900">45</span> sites visited</div>
                    <div><span className="font-bold text-gray-900">$127</span> yearly</div>
                    <div><span className="font-bold text-gray-900">12</span> paywalls found</div>
                    <div><span className="font-bold text-gray-900">8</span> ad networks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">4</div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Take Action & Save Money</h3>
                <p className="text-gray-600 text-lg">
                  Identify unnecessary subscriptions, avoid paywalls, and make informed decisions about what you actually need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage subscriptions smarter</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <Zap size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto-Detection</h3>
              <p className="text-gray-600">
                Automatically detects 30+ ad networks, subscription paywalls, and pricing pages as you browse the web.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <BarChart3 size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Analytics</h3>
              <p className="text-gray-600">
                Track spending by category, see your top subscriptions, and identify opportunities to save money.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <Eye size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Site Analysis</h3>
              <p className="text-gray-600">
                Know which sites have ads, paywalls, or subscription mentions before you visit them. Stay informed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <Lock size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Private</h3>
              <p className="text-gray-600">
                Your data stays yours. HTTPS encrypted, no tracking, auto-deletes after 90 days. Never shared.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <TrendingUp size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time-Based Tracking</h3>
              <p className="text-gray-600">
                See how much time you spend on each site. Identify your most-visited subscription platforms.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <Users size={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600">
                No signup required for basic features. When you sign in, we respect your privacy completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SCREENSHOTS / VISUAL DEMO ============ */}
      <section id="screenshots" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">Beautiful, intuitive interface designed for you</p>
          </div>

          <div className="space-y-8">
            {/* Screenshot 1 - Dashboard */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Your Analytics Dashboard</h3>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-blue-600">45</div>
                    <div className="text-sm text-gray-600">Sites Visited</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-purple-600">$127/yr</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <div className="text-sm text-gray-600">Paywalls</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-orange-600">34</div>
                    <div className="text-sm text-gray-600">Ads Detected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 2 - Top Domains */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🌐 Top Visited Domains</h3>
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-medium">Domain</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-medium">Visits</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">netflix.com</td>
                      <td className="px-6 py-3">25</td>
                      <td className="px-6 py-3">45h</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">spotify.com</td>
                      <td className="px-6 py-3">18</td>
                      <td className="px-6 py-3">32h</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">medium.com</td>
                      <td className="px-6 py-3">42</td>
                      <td className="px-6 py-3">28h</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3">nytimes.com</td>
                      <td className="px-6 py-3">15</td>
                      <td className="px-6 py-3">12h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Screenshot 3 - Popup */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💬 Extension Popup</h3>
              <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg">
                <div className="text-center mb-4">
                  <span className="text-2xl">💰</span>
                  <h4 className="font-bold text-gray-900">SubTrack</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Connected</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages Visited</span>
                    <span className="font-bold">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ads Detected</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paywalls Found</span>
                    <span className="font-bold">2</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded text-sm font-medium">
                  📊 Open Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section id="benefits" className="py-20 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SubTrack?</h2>
            <p className="text-xl text-gray-600">The smarter way to manage subscriptions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Save $500+ Annually</h4>
                  <p className="text-gray-600">Average user saves money by canceling forgotten subscriptions</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Takes 30 Seconds</h4>
                  <p className="text-gray-600">Install extension and start tracking immediately. No setup needed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Completely Free to Start</h4>
                  <p className="text-gray-600">Free tier includes full tracking. Pro features are optional.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">No Account Required Initially</h4>
                  <p className="text-gray-600">Start tracking without creating an account. Optional sign-in.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Lock size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Your Privacy Matters</h4>
                  <p className="text-gray-600">HTTPS encrypted. Data auto-deletes after 90 days. Never shared.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">See What You&apos;re Missing</h4>
                  <p className="text-gray-600">Discover paywalls and subscription opportunities before committing.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <BarChart3 size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Beautiful Analytics</h4>
                  <p className="text-gray-600">Understand your spending with gorgeous, easy-to-read dashboards.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <TrendingUp size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Make Smarter Decisions</h4>
                  <p className="text-gray-600">Know which services are worth the money based on your usage.</p>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Results</h2>
            <p className="text-xl text-gray-600">What users are saving with SubTrack</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg text-center">
              <div className="text-4xl font-bold mb-3">50K+</div>
              <div className="text-blue-100">Active Users Tracking</div>
              <div className="text-sm text-blue-200 mt-2">And growing daily</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-lg text-center">
              <div className="text-4xl font-bold mb-3">$25M+</div>
              <div className="text-green-100">Total Saved by Users</div>
              <div className="text-sm text-green-200 mt-2">Average $500 per user</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-lg text-center">
              <div className="text-4xl font-bold mb-3">4.8★</div>
              <div className="text-purple-100">Chrome Store Rating</div>
              <div className="text-sm text-purple-200 mt-2">From 12,000+ reviews</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &quot;SubTrack saved me $840 this year! I had 3 subscriptions I completely forgot about. The extension runs silently in the background and the dashboard is beautiful.&quot;
              </p>
              <div className="font-bold text-gray-900">Sarah M.</div>
              <div className="text-sm text-gray-600">Designer from California</div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &quot;Finally understand where my money is going. The paywall detection is incredibly helpful - now I know which sites have paywalls before I visit them.&quot;
              </p>
              <div className="font-bold text-gray-900">James K.</div>
              <div className="text-sm text-gray-600">Software Engineer from NYC</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect to get started</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">$0</div>
              <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium mb-8">
                Get Started
              </button>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">7 days of tracking</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Basic analytics</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Ad detection</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Paywall detection</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-lg border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">For power users</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
              <p className="text-gray-600 mb-6">/month</p>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mb-8">
                Start Free Trial
              </button>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited tracking</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">1 year history</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Email reports</span>
                </div>
                <div className="flex gap-3">
                  <Check size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Wasting Money Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users saving money on subscriptions. Install SubTrack free for 7 days.
          </p>
          <button className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-bold flex items-center justify-center gap-2 mx-auto">
            <Home size={24} />
            Install Free Extension
            <ArrowRight size={24} />
          </button>
          <p className="text-sm text-blue-200 mt-4">
            ✨ No credit card. No signup. Just install and start saving.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 SubTrack. All rights reserved. Built with ❤️ to save you money.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
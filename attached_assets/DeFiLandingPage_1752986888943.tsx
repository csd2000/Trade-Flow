import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-12">
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold mb-4">💼 DeFi Strategist Pro</h1>
        <p className="text-lg text-gray-300">Unified crypto platform for daily income, portfolio tracking, strategic exits, and real-time discovery.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <Link href={section.href} key={section.id}>
            <a className="bg-gray-800 hover:bg-gray-700 transition rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>
              <span className="mt-4 inline-block text-blue-400 hover:underline">Explore →</span>
            </a>
          </Link>
        ))}
      </main>

      <footer className="text-center mt-16 text-gray-500 text-sm">
        Built for serious traders. Powered by DeFi.
      </footer>
    </div>
  );
}

const sections = [
  {
    id: 'dashboard',
    title: '📊 Elite Dashboard',
    description: 'Unified view of strategies, PnL, alerts, and yield stats.',
    href: '/dashboard',
  },
  {
    id: 'strategies',
    title: '💰 Trading Strategies',
    description: 'Passive income, AI signals, Velez & Pelosi-style plays.',
    href: '/strategies',
  },
  {
    id: 'portfolio',
    title: '📁 Live Portfolio Tracker',
    description: 'Connect wallet and track positions, earnings, and risk.',
    href: '/portfolio',
  },
  {
    id: 'training',
    title: '📘 Education & Courses',
    description: 'Step-by-step learning from beginner to expert.',
    href: '/training',
  },
  {
    id: 'project-discovery',
    title: '🧪 Project Discovery',
    description: 'Find new token launches, airdrops, trending narratives.',
    href: '/project-discovery',
  },
  {
    id: 'exit-strategy',
    title: '💡 Exit Planner',
    description: 'DCA plans, alerts, and stablecoin yield routes.',
    href: '/exit-strategy',
  },
  {
    id: 'calendar',
    title: '📅 Economic Calendar',
    description: 'Token unlocks, CPI reports, Fed meetings & more.',
    href: '/calendar',
  },
  {
    id: 'hub',
    title: '🧩 Consolidated Hub',
    description: 'Quick access to all tools in one place.',
    href: '/hub',
  },
];
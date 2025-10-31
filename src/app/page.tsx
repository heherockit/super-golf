import Hero from '@/components/Hero';

import FeatureCards from '@/components/FeatureCards';

import Footer from '@/components/Footer';

import dynamic from 'next/dynamic';

const EngagementWidget = dynamic(() => import('@/components/EngagementWidget'));

const MetricsEngagementWidget = dynamic(() => import('@/components/MetricsEngagementWidget'));

const Testimonials = dynamic(() => import('@/components/Testimonials'));

/**
 * Home page showcasing hero, features, engagement, and premium footer.
 */
export default function HomePage() {
  return (
    <div className="">
      <Hero />
      <FeatureCards />
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-emerald">Elevate Your Game</h2>
          <p className="mt-4 font-medium text-gray-700">
            Interactive tools, personalized plans, and pro-grade insights.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="ease-std rounded-xl border p-6 shadow-sm transition-transform duration-std hover:scale-105 hover:shadow-md">
              <h3 className="text-xl font-semibold text-emerald">Onboarding Wizard</h3>
              <p className="mt-2 text-gray-600">
                Guide your setup in 4 steps to tailor recommendations.
              </p>
            </div>
            <div className="ease-std rounded-xl border p-6 shadow-sm transition-transform duration-std hover:scale-105 hover:shadow-md">
              <h3 className="text-xl font-semibold text-emerald">Smart Insights</h3>
              <p className="mt-2 text-gray-600">
                Receive data-driven tips matched to your profile.
              </p>
            </div>
            <div className="ease-std rounded-xl border p-6 shadow-sm transition-transform duration-std hover:scale-105 hover:shadow-md">
              <h3 className="text-xl font-semibold text-emerald">Premium Support</h3>
              <p className="mt-2 text-gray-600">
                Direct contact with our advisors for top-tier guidance.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Testimonials />
          </div>
          <MetricsEngagementWidget />
        </div>
      </section>
      <Footer />
    </div>
  );
}

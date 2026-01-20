"use client";

import { BookOpen, Users, Award, BarChart3, Clock, Shield, CheckCircle, Star, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">uEdu</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition">Testimonials</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">Admin Login</Link>
            <Link href="/student" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Student Portal
            </Link>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Modernize Your English
          <span className="block text-blue-600">Academy Management</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Streamline your English academy operations with our comprehensive platform. Manage students, teachers, courses, and exams in one powerful system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition">
            Book a Demo
          </button>
        </div>
        <p className="mt-6 text-gray-500">No credit card required • Free 14-day trial</p>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Academies</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Students</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Exams Created</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction</div>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Powerful Features for Your Academy</h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Everything you need to run a successful English academy in one integrated platform
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="h-10 w-10 text-blue-600" />}
            title="Student Management"
            description="Effortlessly enroll, track, and manage students with comprehensive profiles and progress tracking."
          />
          <FeatureCard
            icon={<BookOpen className="h-10 w-10 text-blue-600" />}
            title="Course Administration"
            description="Create and manage English courses with flexible scheduling, materials, and curriculum planning."
          />
          <FeatureCard
            icon={<Award className="h-10 w-10 text-blue-600" />}
            title="Exam Platform"
            description="Build and conduct placement tests, progress exams, and final exams with auto-grading."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-blue-600" />}
            title="Analytics Dashboard"
            description="Get real-time insights into student performance, enrollment trends, and academy growth."
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-blue-600" />}
            title="Time Management"
            description="Schedule classes, track attendance, and manage teacher assignments efficiently."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-blue-600" />}
            title="Secure & Reliable"
            description="Enterprise-grade security with data encryption and reliable uptime for peace of mind."
          />
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Get started in minutes with our simple setup process
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Sign Up</h3>
              <p className="text-gray-600">Create your account in seconds. No credit card required for the free trial.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Setup Your Academy</h3>
              <p className="text-gray-600">Add your courses, teachers, and customize settings to match your academy's needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Start Managing</h3>
              <p className="text-gray-600">Enroll students, schedule classes, create exams, and watch your academy grow.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Choose the plan that fits your academy's needs
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Starter"
            price="49"
            description="Perfect for small academies"
            features={[
              "Up to 100 students",
              "3 teachers",
              "5 courses",
              "Basic analytics",
              "Email support"
            ]}
          />
          <PricingCard
            name="Professional"
            price="99"
            description="For growing academies"
            features={[
              "Up to 500 students",
              "15 teachers",
              "Unlimited courses",
              "Advanced analytics",
              "Priority support",
              "Custom branding"
            ]}
            popular
          />
          <PricingCard
            name="Enterprise"
            price="249"
            description="For large institutions"
            features={[
              "Unlimited students",
              "Unlimited teachers",
              "Unlimited courses",
              "Full analytics suite",
              "24/7 phone support",
              "Custom integrations",
              "Dedicated account manager"
            ]}
          />
        </div>
      </section>

      <section id="testimonials" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Trusted by Academies Worldwide</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            See what academy owners and administrators say about uEdu
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Academy Director"
              quote="uEdu has transformed how we manage our academy. The exam platform alone saves us 20+ hours per week."
            />
            <TestimonialCard
              name="Michael Chen"
              role="Operations Manager"
              quote="The analytics dashboard gives us insights we never had before. Our student retention improved by 30%."
            />
            <TestimonialCard
              name="Emma Williams"
              role="Head Teacher"
              quote="Creating and grading exams has never been easier. The platform is intuitive and saves so much time."
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Academy?</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Join 500+ academies already using uEdu to streamline their operations and improve student outcomes.
        </p>
        <button className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          Start Your Free Trial
        </button>
        <p className="mt-4 text-gray-500">14-day free trial • No credit card required</p>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">uEdu</span>
              </div>
              <p className="text-sm">
                Modern English academy management system built for today's educational institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Updates</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2024 uEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, description, features, popular }: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-sm ${popular ? 'ring-2 ring-blue-600 scale-105' : ''}`}>
      {popular && (
        <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-bold">${price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-lg font-semibold transition ${
        popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
      }`}>
        Get Started
      </button>
    </div>
  );
}

function TestimonialCard({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-gray-600 text-sm">{role}</div>
      </div>
    </div>
  );
}

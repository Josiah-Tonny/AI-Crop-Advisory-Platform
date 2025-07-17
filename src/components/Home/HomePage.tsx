import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  CloudRain, 
  Sprout, 
  TestTube, 
  TrendingUp,
  Users,
  Award,
  Globe,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Advisory',
      description: 'Get intelligent crop recommendations based on real-time weather data and soil conditions.',
      href: '/ai-advisory',
      color: 'bg-purple-500',
      badge: 'Popular'
    },
    {
      icon: CloudRain,
      title: 'Weather Forecasting',
      description: 'Accurate 7-day weather forecasts with agricultural insights and alerts.',
      href: '/weather',
      color: 'bg-blue-500'
    },
    {
      icon: TestTube,
      title: 'Soil Analysis',
      description: 'Comprehensive soil health assessment with nutrient management recommendations.',
      href: '/soil',
      color: 'bg-amber-500'
    },
    {
      icon: Sprout,
      title: 'Crop Management',
      description: 'Monitor crop health, track growth stages, and optimize farming practices.',
      href: '/crops',
      color: 'bg-green-500'
    }
  ];

  const stats = [
    { label: 'Farmers Served', value: '50,000+', icon: Users },
    { label: 'Yield Increase', value: '25%', icon: TrendingUp },
    { label: 'Countries', value: '15', icon: Globe },
    { label: 'AI Accuracy', value: '94%', icon: Zap }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-blue-600 px-8 py-12 text-white">
        <div className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Transform Your Farm with
              <span className="block text-green-200">AI-Powered Insights</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-green-100">
              Empowering smallholder farmers across East and Central Africa with intelligent 
              agricultural solutions. Increase yields, optimize resources, and build sustainable farming practices.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50">
                <Link to="/ai-advisory">
                  Get AI Advisory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-700">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with practical farming expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`${feature.color} p-3 rounded-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary">{feature.badge}</Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-green-600 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-green-50">
                  <Link to={feature.href}>
                    Explore Feature
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Farm?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AI to increase their yields and optimize their farming practices.
            </p>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link to="/ai-advisory">
                Start Your AI Advisory
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BarChart3,
  Ticket,
  Clock,
  Archive,
  Shield,
  Settings,
  UserCheck,
  Wrench,
  User,
  Star,
  Menu,
} from "lucide-react";
import Link from "next/link";
import content from "@/content/static.json";

export default function LandingPage() {
  const { landingPage } = content;
  const features = [
    {
      icon: Users,
      title: landingPage.features.items[0].title,
      description: landingPage.features.items[0].description,
    },
    {
      icon: BarChart3,
      title: landingPage.features.items[1].title,
      description: landingPage.features.items[1].description,
    },
    {
      icon: Ticket,
      title: landingPage.features.items[2].title,
      description: landingPage.features.items[2].description,
    },
    {
      icon: Clock,
      title: landingPage.features.items[3].title,
      description: landingPage.features.items[3].description,
    },
    {
      icon: Archive,
      title: landingPage.features.items[4].title,
      description: landingPage.features.items[4].description,
    },
  ];

  const roles = [
    {
      icon: Shield,
      title: landingPage.roles.items[0].title,
      description: landingPage.roles.items[0].description,
    },
    {
      icon: Settings,
      title: landingPage.roles.items[1].title,
      description: landingPage.roles.items[1].description,
    },
    {
      icon: UserCheck,
      title: landingPage.roles.items[2].title,
      description: landingPage.roles.items[2].description,
    },
    {
      icon: Wrench,
      title: landingPage.roles.items[3].title,
      description: landingPage.roles.items[3].description,
    },
    {
      icon: User,
      title: landingPage.roles.items[4].title,
      description: landingPage.roles.items[4].description,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {landingPage.nav.brand}
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {landingPage.nav.features}
              </Link>
              <Link
                href="#roles"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {landingPage.nav.roles}
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {landingPage.nav.testimonials}
              </Link>
              <Link href="/login">
                <Button size="sm">{landingPage.nav.getStarted}</Button>
              </Link>
            </div>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 bg-blue-100 text-primary hover:bg-blue-100"
            >
              {landingPage.hero.badge}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {landingPage.hero.title[0]} <br />
              <span className="bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                {landingPage.hero.title[1]}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {landingPage.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg">{landingPage.hero.getStarted}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {landingPage.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {landingPage.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section
        id="roles"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {landingPage.roles.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {landingPage.roles.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">
                      {role.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gray-100 overflow-hidden">
        {/* Decorative SVG Blobs */}
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] opacity-30 pointer-events-none select-none z-0">
          <svg viewBox="0 0 400 400" fill="none">
            <ellipse cx="200" cy="200" rx="200" ry="200" fill="#3B82F6" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] opacity-20 pointer-events-none select-none z-0">
          <svg viewBox="0 0 300 300" fill="none">
            <ellipse cx="150" cy="150" rx="150" ry="150" fill="#60A5FA" />
          </svg>
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-primary mb-6 drop-shadow-md">
            {landingPage.cta.title[0]}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {landingPage.cta.title[1]}
            </span>{" "}
            {landingPage.cta.title[2]}
          </h2>
          <p className="text-xl sm:text-2xl text-blue-800 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            {landingPage.cta.subtitle[0]}{" "}
            <span className="font-bold text-blue-600">
              {landingPage.cta.subtitle[1]}
            </span>{" "}
            {landingPage.cta.subtitle[2]}{" "}
            <span className="font-semibold text-blue-700">
              {landingPage.cta.subtitle[3]}
            </span>
            {landingPage.cta.subtitle[4]}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl"
            >
              {landingPage.cta.getStarted}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">
                  {landingPage.footer.brand}
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {landingPage.footer.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {landingPage.footer.company.title}
              </h3>
              <ul className="space-y-2 text-gray-400">
                {/* <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.company.about}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.company.contact}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.company.careers}
                  </Link>
                </li> */}
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.company.blog}
                  </Link>
                </li>
              </ul>
            </div>

            {/* <div>
              <h3 className="font-semibold mb-4">
                {landingPage.footer.legal.title}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.legal.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.legal.terms}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.legal.security}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {landingPage.footer.legal.support}
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} {landingPage.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

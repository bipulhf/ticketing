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

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "User Roles",
      description:
        "Comprehensive role-based access control for different team members",
    },
    {
      icon: BarChart3,
      title: "Real-time Dashboards",
      description:
        "Monitor ticket status, performance metrics, and team productivity",
    },
    {
      icon: Ticket,
      title: "Ticket Management",
      description:
        "Streamlined ticket creation, assignment, and resolution tracking",
    },
    {
      icon: Clock,
      title: "Expiry Control",
      description: "Automated ticket expiry and escalation management",
    },
    {
      icon: Archive,
      title: "Archiving",
      description: "Secure ticket archiving and historical data management",
    },
  ];

  const roles = [
    {
      icon: Shield,
      title: "System Owner",
      description:
        "Complete system oversight with full administrative privileges and strategic control",
    },
    {
      icon: Settings,
      title: "Super Admin",
      description:
        "Advanced configuration management and user administration capabilities",
    },
    {
      icon: UserCheck,
      title: "Admin",
      description:
        "Department-level management with ticket oversight and team coordination",
    },
    {
      icon: Wrench,
      title: "IT Person",
      description:
        "Technical ticket resolution with specialized tools and escalation rights",
    },
    {
      icon: User,
      title: "User",
      description:
        "Ticket submission and tracking with self-service portal access",
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
                HelpDesk Pro
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#roles"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Roles
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Testimonials
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
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
              Trusted by 500+ IT Teams
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your <br />
              <span className="bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                IT Support Workflow
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A role-based ticketing system built for efficiency and control.
              Empower your IT team with intelligent automation and comprehensive
              oversight.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
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
              Powerful Features for Modern IT Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage, track, and resolve IT tickets
              efficiently
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
              Role-Based Access Control
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored permissions and capabilities for every team member
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
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Transform
            </span>{" "}
            Your IT Support?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-800 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Join{" "}
            <span className="font-bold text-blue-600">
              hundreds of IT teams
            </span>{" "}
            who have streamlined their workflow with{" "}
            <span className="font-semibold text-blue-700">HelpDesk Pro</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl"
            >
              Get Started
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
                <span className="text-xl font-bold">HelpDesk Pro</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Streamline your IT support workflow with our comprehensive
                ticketing system designed for modern teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} HelpDesk Pro. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

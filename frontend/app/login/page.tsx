"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Users,
  Shield,
  FileText,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Award,
  TrendingUp,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!credentials.username || !credentials.password || !credentials.role) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const needsOnboarding = credentials.role === "user";

      if (needsOnboarding) {
        window.location.href = "/onboarding";
      } else {
        window.location.href = `/${credentials.role}-dashboard`;
      }
    }, 1500);
  };

  const roleOptions = [
    {
      value: "user",
      label: "Researcher",
      icon: Users,
      description: "Apply for grants and manage research projects",
    },
    {
      value: "reviewer",
      label: "Reviewer",
      icon: FileText,
      description: "Review and evaluate applications",
    },
    {
      value: "admin",
      label: "Administrator",
      icon: Shield,
      description: "System management and oversight",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-purple-400 rounded-full opacity-5 blur-2xl"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Ticket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  HelpDesk Pro
                </h1>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-800 leading-tight">
                Accelerate Your
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  IT Support Journey
                </span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Streamline IT support, manage tickets, and collaborate with
                peers in our comprehensive IT support platform.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">50+</div>
                  <div className="text-xs text-slate-600">Active Tickets</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">200+</div>
                  <div className="text-xs text-slate-600">Total Tickets</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">500+</div>
                  <div className="text-xs text-slate-600">Users</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-slate-500">
            <p>© 2025 HelpDesk Pro. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                HelpDesk Pro
              </h1>
            </div>

            {/* Main Login Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <p className="text-slate-600">Sign in to continue</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          username: e.target.value,
                        })
                      }
                      className="pl-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      className="pl-12 pr-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Back to Home */}
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    asChild
                    className="text-slate-600 hover:text-slate-800"
                  >
                    <Link href="/">← Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

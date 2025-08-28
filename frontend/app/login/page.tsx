import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, TrendingUp, Ticket } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/login/login-form";
import content from "@/content/static.json";

export default function LoginPage() {
  const { loginPage, landingPage } = content;
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
                  {landingPage.nav.brand}
                </h1>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-800 leading-tight">
                {loginPage.title[0]}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  {loginPage.title[1]}
                </span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {loginPage.subtitle}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">50+</div>
                  <div className="text-xs text-slate-600">
                    {loginPage.stats.activeTickets}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">200+</div>
                  <div className="text-xs text-slate-600">
                    {loginPage.stats.totalTickets}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">500+</div>
                  <div className="text-xs text-slate-600">
                    {loginPage.stats.users}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-slate-500">
            <p>{loginPage.copyright}</p>
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
                {landingPage.nav.brand}
              </h1>
            </div>

            {/* Main Login Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <p className="text-slate-600">{loginPage.form.title}</p>
              </CardHeader>

              <CardContent className="">
                <LoginForm />
                {/* Back to Home */}
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    asChild
                    className="text-slate-600 hover:text-slate-800"
                  >
                    <Link href="/">{loginPage.form.backToHome}</Link>
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

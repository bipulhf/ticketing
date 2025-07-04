import { HelpCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="relative">
            <div className="p-3 rounded-xl bg-primary shadow-lg">
              <HelpCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            {/* Pulse animation ring */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">HelpDesk Pro</h1>
            <p className="text-sm text-muted-foreground">IT Support Platform</p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSettings } from "@/context/settings-context";
import { 
  Building2, 
  CreditCard, 
  Users, 
  LifeBuoy, 
  Copy, 
  Check, 
  ExternalLink,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function SettingsContent() {
  const { settings, isPlanActive, daysUntilRenewal } = useSettings();
  const [activeTab, setActiveTab] = useState("general");

  if (!settings) return null;

  return (
    // TWEAK: Reduced vertical margin on mobile (my-6 vs my-12)
    <div className="container mx-auto max-w-5xl px-4 md:px-10 lg:px-0 my-6 md:my-12 pb-20">
      
      {/* TWEAK: Smaller header text on mobile */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Account</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          View your organization configuration and subscription details.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* --- MOBILE OPTIMIZED NAVIGATION --- */}
        <nav className="w-full md:w-64 flex-shrink-0">
          {/* TWEAK: -mx-4 allows tabs to scroll edge-to-edge on mobile while keeping container padding elsewhere */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
            <NavButton 
              active={activeTab === "general"} 
              onClick={() => setActiveTab("general")}
              icon={Building2}
              label="Overview"
            />
            <NavButton 
              active={activeTab === "billing"} 
              onClick={() => setActiveTab("billing")}
              icon={CreditCard}
              label="Billing"
            />
            <NavButton 
              active={activeTab === "team"} 
              onClick={() => setActiveTab("team")}
              icon={Users}
              label="Team"
            />
            <div className="hidden md:block md:pt-4 md:mt-4 md:border-t md:border-gray-100">
              <NavButton 
                active={activeTab === "support"} 
                onClick={() => setActiveTab("support")}
                icon={LifeBuoy}
                label="Concierge"
              />
            </div>
            {/* Mobile-only support button to keep it in the flow */}
            <div className="md:hidden">
              <NavButton 
                active={activeTab === "support"} 
                onClick={() => setActiveTab("support")}
                icon={LifeBuoy}
                label="Support"
              />
            </div>
          </div>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 space-y-6">
          
          {/* 1. GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Organization Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                   <ReadOnlyField label="Company Name" value={settings.companyName || "N/A"} />
                   <ReadOnlyField label="Subdomain Slug" value={settings.slug} copyable />
                   <div className="md:col-span-2">
                     <ReadOnlyField label="Hue-Line Domain" value={settings.projectUrl || ""} copyable isLink />
                   </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Telephony Configuration" description="Managed by Hue-Line" />
                {/* TWEAK: Reduced padding on mobile (p-4 vs p-6) */}
                <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* The Hue-Line Number */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-2 mb-1">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Hue-Line</span>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight break-all">
                        {settings.twilioPhoneNumber || "Pending..."}
                      </div>
                    
                    </div>

                    <div className="hidden md:flex items-center justify-center">
                      <ArrowRight className="text-blue-300 w-6 h-6" />
                    </div>

                    {/* The Client's Forwarding Number */}
                    <div className="flex-1 w-full border-t md:border-t-0 pt-4 md:pt-0 border-blue-100">
                       <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Forwards To</span>
                      </div>
                      <div className="text-lg font-medium text-gray-700 break-all">
                        {settings.forwardingNumber || "Not Set"}
                      </div>
                     
                    </div>

                  </div>
                </div>
                <div className="px-4 md:px-6 pb-6 pt-4">
                  <p className="text-xs text-gray-400 italic">
                    *To update routing numbers, please contact support.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 2. BILLING TAB */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Current Subscription" />
                
                {/* TWEAK: Stack flex-col on mobile, align items start */}
                <div className="mt-6 p-4 md:p-6 rounded-xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex items-start md:items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center ${isPlanActive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {isPlanActive ? <CreditCard className="w-6 h-6 text-emerald-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{settings.planName || "Standard Plan"}</h4>
                      <p className="text-sm text-gray-500">
                        {isPlanActive ? "Active" : "Inactive"} 
                        {daysUntilRenewal !== null && ` • Renews in ${daysUntilRenewal} days`}
                      </p>
                    </div>
                  </div>
                  
                  {/* TWEAK: Button is full width on mobile for easier tapping */}
                  <button className="w-full md:w-auto inline-flex justify-center items-center px-4 py-3 md:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                    Manage in Stripe
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FeatureItem text="Unlimited AI Minutes" />
                    <FeatureItem text="Dedicated Phone Number" />
                    <FeatureItem text="Priority Concierge Support" />
                    <FeatureItem text="Advanced Analytics" />
                  </ul>
                </div>
              </Card>
            </div>
          )}

           {/* 3. TEAM TAB */}
           {activeTab === "team" && (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                  <CardHeader title="Team Members" description="Users with access." />
                </div>
                
                <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                   {settings.users && settings.users.length > 0 ? (
                     settings.users.map((user) => (
                       <div key={user.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-3">
                          <div className="flex items-center">
                             <div className="h-10 w-10 rounded-full flex-shrink-0 bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                               {user.name ? user.name.substring(0,2).toUpperCase() : "U"}
                             </div>
                             <div className="ml-4 overflow-hidden">
                               <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Unknown User"}</p>
                               <p className="text-xs text-gray-500 truncate">{user.email}</p>
                             </div>
                          </div>
                          <span className="self-start sm:self-center inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {user.role}
                          </span>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-gray-500 text-sm">No team members found.</div>
                   )}
                </div>
              </Card>
            </div>
          )}

          {/* 4. SUPPORT TAB */}
          {activeTab === "support" && (
             <div className="space-y-6">
             <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                     <ShieldCheck className="w-6 h-6 text-blue-400" />
                     <h2 className="text-xl font-bold">Priority Concierge</h2>
                  </div>
                  
                  <p className="text-blue-200 mb-8 max-w-lg text-sm leading-relaxed">
                    Direct access to our engineering team for configuration changes, custom routing, or feature requests.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                           <LifeBuoy className="w-5 h-5 text-blue-300" />
                        </div>
                        <span className="font-semibold text-sm">Email Support</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight mb-1 break-all">support@hue-line.com</p>
                      <p className="text-xs text-gray-400">Response time: &lt; 2 hours</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                           <Phone className="w-5 h-5 text-emerald-300" />
                        </div>
                        <span className="font-semibold text-sm">Direct Line</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight mb-1">+1 (555) 999-8888</p>
                      <p className="text-xs text-gray-400">Mon-Fri, 9AM - 6PM EST</p>
                    </div>
                  </div>
                </div>
             </div>
           </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      // TWEAK: whitespace-nowrap prevents text splitting on mobile
      className={`
        whitespace-nowrap flex items-center space-x-3 px-4 py-2.5 rounded-full md:rounded-lg text-sm font-medium transition-colors text-left border md:border-0 cursor-pointer
        ${active 
          ? "bg-blue-600 text-white md:bg-blue-50 md:text-blue-700 border-blue-600 shadow-sm md:shadow-none" 
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"}
      `}
    >
      {/* TWEAK: Icon sizing slightly flexible */}
      <Icon className={`w-4 h-4 md:w-5 md:h-5 ${active ? "text-white md:text-blue-600" : "text-gray-400"}`} />
      <span>{label}</span>
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    // TWEAK: Reduced padding on mobile wrapper
    <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold leading-6 text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value, copyable, isLink }: { label: string, value: string | null, copyable?: boolean, isLink?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = value || "N/A";

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {/* TWEAK: h-auto with py-3 allows content to wrap if screen is extremely small, preventing cut-off */}
      <div className="group flex items-center justify-between px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[3rem]">
        <div className="min-w-0 flex-1 mr-2">
            {isLink && value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-blue-600 hover:underline truncate">
                {displayValue}
            </a>
            ) : (
            <p className="text-sm font-medium text-gray-900 truncate">{displayValue}</p>
            )}
        </div>
        
        {copyable && value && (
          <button 
            onClick={handleCopy}
            // TWEAK: Increased touch target for mobile
            className="flex-shrink-0 p-2 rounded-md hover:bg-white text-gray-400 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start md:items-center text-sm text-gray-600">
      <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
      <span className="leading-tight">{text}</span>
    </li>
  )
}
"use client";

import React, { useState, useMemo } from "react";

import { 
  Users, 
  Clock, 
  CheckCircle, 
  Activity, 
  Building,
  Mail,
  CreditCard,
  ChevronRight,
  Phone,
  Calendar
} from "lucide-react";
import { Prisma } from "@/app/generated/prisma";

type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    clientActivities: true;
    subdomain: {
      select: {
        slug: true;
        logo: true;
        logoHeight: true;
        logoWidth: true;
        companyName: true;
        calls: true;
        logs: true;
        bookings: true;
      };
    };
    _count: true;
  };
}>;

interface AdminClientPageProps {
  clientData: ClientWithRelations[];
}

export default function AdminClientPage({ clientData }: AdminClientPageProps) {
  const[selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = clientData.length;
    const pendingIntake = clientData.filter((c) => c.status === "PENDING_INTAKE").length;
    const activeSubdomains = clientData.filter((c) => c.subdomain != null).length;
    return { total, pendingIntake, activeSubdomains };
  }, [clientData]);

  const displayedActivities = useMemo(() => {
    let activities: any[] = [];
    if (selectedClientId) {
      const client = clientData.find((c) => c.id === selectedClientId);
      activities = client?.clientActivities || [];
    } else {
      activities = clientData.flatMap((c) => 
        c.clientActivities.map(activity => ({
          ...activity,
          clientName: c.company || c.firstName || c.email
        }))
      );
    }
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15);
  }, [clientData, selectedClientId]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="admin-first-div">
      <div className="px-6 max-w-8xl mx-auto space-y-6">
        
        {/* HEADER & STATS CARDS */}
        <div>
          <h1 className="text-2xl font-bold text-primary mb-6">Client Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Clients</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Intake</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.pendingIntake}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Live Subdomains</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.activeSubdomains}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: ENRICHED CLIENT LIST */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-semibold text-slate-800">Client Directory</h2>
              {selectedClientId && (
                <button 
                  onClick={() => setSelectedClientId(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View All Activity
                </button>
              )}
            </div>
            
            <div className="divide-y divide-slate-100 max-h-150 overflow-y-auto">
              {clientData.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No clients found.</div>
              ) : (
                clientData.map((client) => (
                  <div 
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      selectedClientId === client.id ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 mt-1 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm">
                        {(client.company || client.firstName || client.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-900 text-base">
                          {client.company || client.firstName || "Unknown Client"}
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-37.5">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center space-x-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Joined {formatDate(client.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span className={client.setupFeePaid ? "text-emerald-600" : "text-amber-600"}>
                              {client.setupFeePaid ? "Fee Paid" : "Unpaid"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        client.status === "PENDING_INTAKE" ? "bg-amber-100 text-amber-700" :
                        client.status === "JOB_COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {client.status.replace(/_/g, " ")}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: ACTIVITY TIMELINE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-150">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-slate-500" />
                {selectedClientId 
                  ? "Client History" 
                  : "Recent Global Activity"}
              </h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {displayedActivities.length === 0 ? (
                <div className="text-center text-sm text-slate-500 mt-10">
                  No activity logs found.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                  {displayedActivities.map((log) => {
                    let Icon = CheckCircle;
                    let iconColor = "text-slate-400 bg-slate-100";

                    if (log.type.includes("EMAIL")) {
                      Icon = Mail;
                      iconColor = "text-blue-500 bg-blue-50";
                    } else if (log.type.includes("FEE") || log.type.includes("SUBSCRIPTION")) {
                      Icon = CreditCard;
                      iconColor = "text-emerald-500 bg-emerald-50";
                    } else if (log.type.includes("SUBDOMAIN") || log.type.includes("WORK")) {
                      Icon = Building;
                      iconColor = "text-purple-500 bg-purple-50";
                    }

                    return (
                      <div key={log.id} className="relative pl-6">
                        <div className={`absolute -left-4.25 p-1.5 rounded-full ring-4 ring-white ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 mb-1">
                            {formatDate(log.createdAt)}
                          </span>
                          
                          {!selectedClientId && (log as any).clientName && (
                            <span className="text-xs font-semibold text-blue-600 mb-1">
                              @{(log as any).clientName}
                            </span>
                          )}

                          <span className="font-medium text-slate-800 text-sm">
                            {log.title || log.type.replace(/_/g, " ")}
                          </span>
                          
                          {log.description && (
                            <span className="text-sm text-slate-500 mt-1">
                              {log.description}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
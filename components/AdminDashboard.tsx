
import React from 'react';
import { BarChart3, Users, Leaf, Activity, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, UserPlus, Database, CreditCard } from 'lucide-react';
import { User } from '../types';

interface AdminDashboardProps {
  users?: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users = [] }) => {
  const premiumUsers = users.filter(u => u.plan !== 'free').length;
  const totalUsers = users.length;
  const conversionRate = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Monitoring usage and system health</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
          <Activity className="w-4 h-4" />
          <span>System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Scans" 
          value="12,543" 
          change="+12%" 
          trend="up" 
          icon={<Leaf className="w-5 h-5 text-emerald-500" />} 
        />
        <StatsCard 
          title="Active Users" 
          value={totalUsers.toString()} 
          change="+5%" 
          trend="up" 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
        />
        <StatsCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          change="+2%" 
          trend="up" 
          icon={<CreditCard className="w-5 h-5 text-amber-500" />} 
        />
        <StatsCard 
          title="Diagnoses" 
          value="3,102" 
          change="+28%" 
          trend="up" 
          icon={<ShieldCheck className="w-5 h-5 text-purple-500" />} 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Identifications</h3>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Mode</th>
                  <th className="px-6 py-3 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <TableRow 
                  user="Alice M." 
                  mode="Identify" 
                  result="Monstera Deliciosa" 
                />
                <TableRow 
                  user="Bob S." 
                  mode="Diagnose" 
                  result="Root Rot (Fungal)" 
                />
                <TableRow 
                  user="Charlie D." 
                  mode="Identify" 
                  result="Snake Plant" 
                />
                <TableRow 
                  user="Dana K." 
                  mode="Diagnose" 
                  result="Spider Mites" 
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* User Registry Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Registered Users</h3>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">
              Total: {users.length}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u, i) => (
                  <tr key={i} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-100" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        u.plan === 'free'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          : u.plan === 'monthly'
                          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {u.scansRemaining === -1 ? '∞' : u.scansRemaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatsCard = ({ title, value, change, trend, icon, goodTrend = 'up' }: any) => {
  const isPositive = trend === 'up';
  const isGood = trend === goodTrend;
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm">
        {isPositive ? <ArrowUpRight className={`w-4 h-4 ${isGood ? 'text-green-500' : 'text-red-500'}`} /> : <ArrowDownRight className={`w-4 h-4 ${isGood ? 'text-green-500' : 'text-red-500'}`} />}
        <span className={`font-medium ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change}
        </span>
        <span className="text-slate-400 dark:text-slate-500 ml-1">vs last week</span>
      </div>
    </div>
  );
};

const TableRow = ({ user, mode, result }: any) => (
  <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user}</td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        mode === 'Identify' 
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      }`}>
        {mode}
      </span>
    </td>
    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{result}</td>
  </tr>
);

export default AdminDashboard;

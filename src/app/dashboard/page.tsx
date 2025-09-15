"use client";
import { getDashboardData } from '@/lib/data';
import StatCard from '@/components/dashboard/stat-card';
import RecentExpenses from '@/components/dashboard/recent-expenses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { DashboardData } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDashboardData().then(setData).finally(() => setLoading(false));
        console.log("Forcing a reload to fix HMR issue.");
    }, []);

    if (loading || !data) {
        return (
            <>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                 <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                 </div>
            </>
        )
    }
    
    const memberContributions = data.members.map(member => {
        const total = data.expenses
            .filter(e => e.memberId === member.id)
            .reduce((sum, e) => sum + e.amount, 0);
        return { name: member.name, Contribution: total };
    });

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <StatCard title="Overall Budget" value={data.overallBudget} type="currency" description="Total planned budget" icon="💰" />
                <StatCard title="Total Income" value={data.totalIncomes} type="currency" description="Sum of all income" icon="📈" />
                <StatCard title="Total Spent" value={data.totalExpenses} type="currency" description="Sum of all contributions" icon="💸" />
                <StatCard title="Members" value={data.members.length} description="Total trip participants" icon="👥" />
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contributions by Member</CardTitle>
                        <CardDescription>A breakdown of spending by each team member.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={memberContributions}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={{stroke: 'hsl(var(--border))'}}/>
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={{stroke: 'hsl(var(--border))'}} tickFormatter={(value) => `₹${value}`}/>
                                <Tooltip cursor={{fill: 'hsl(var(--accent))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <Bar dataKey="Contribution" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <RecentExpenses expenses={data.expenses} />
            </div>
        </>
    );
}

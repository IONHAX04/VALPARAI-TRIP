"use client";
import { getMockDashboardData } from '@/lib/data';
import StatCard from '@/components/dashboard/stat-card';
import RecentExpenses from '@/components/dashboard/recent-expenses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { DashboardData } from '@/lib/types';
import { useEffect, useState } from 'react';


export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        getMockDashboardData().then(setData);
    }, []);

    if (!data) {
        return <div>Loading dashboard...</div>;
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
                <StatCard title="Total Spent" value={data.totalExpenses} type="currency" description="Sum of all contributions" icon="💸" />
                <StatCard title="Remaining Budget" value={data.remainingBudget} type="currency" description={data.remainingBudget < 0 ? 'Over budget' : 'Funds available'} icon="📊" isNegative={data.remainingBudget < 0}/>
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
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`}/>
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

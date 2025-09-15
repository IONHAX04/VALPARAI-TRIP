"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAiCharts } from '@/app/dashboard/actions';
import type { GenerateDashboardChartsInput, GenerateDashboardChartsOutput } from "@/ai/flows/generate-dashboard-charts";
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Wand2, Terminal, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Skeleton } from '../ui/skeleton';

type AiChartPanelProps = {
    expenses: GenerateDashboardChartsInput['expenses'];
    overallBudget: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const renderChart = (config: GenerateDashboardChartsOutput['chartConfigurations'][0], index: number) => {
    const key = `ai-chart-${index}`;
    switch (config.type.toLowerCase()) {
        case 'pie':
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={config.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {config.data.map((entry: any, i: number) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        case 'bar':
            const dataKey = Object.keys(config.data[0]).find(k => k !== 'name') || 'value';
            return (
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={config.data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'hsl(var(--accent))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            );
        case 'line':
             const lineDataKey = Object.keys(config.data[0]).find(k => k !== 'name') || 'value';
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={config.data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        <Line type="monotone" dataKey={lineDataKey} stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )
        default:
            return <p>Unsupported chart type: {config.type}</p>;
    }
};

export default function AiChartPanel({ expenses, overallBudget }: AiChartPanelProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [charts, setCharts] = useState<GenerateDashboardChartsOutput['chartConfigurations'] | null>(null);

    const handleGenerateCharts = async () => {
        setLoading(true);
        setError(null);
        setCharts(null);
        try {
            const result = await getAiCharts({ expenses, overallBudget });
            setCharts(result.chartConfigurations);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Wand2 className="text-primary" />
                            AI-Powered Insights
                        </CardTitle>
                        <CardDescription>Let AI generate helpful visualizations from your trip data.</CardDescription>
                    </div>
                    <Button onClick={handleGenerateCharts} disabled={loading}>
                        {loading ? 'Generating...' : '✨ Generate Charts'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                     <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {loading && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-3">
                             <Skeleton className="h-[25px] w-2/3 rounded-lg" />
                             <Skeleton className="h-[20px] w-full rounded-lg" />
                             <Skeleton className="h-[250px] w-full rounded-xl" />
                        </div>
                        <div className="flex flex-col space-y-3">
                             <Skeleton className="h-[25px] w-2/3 rounded-lg" />
                             <Skeleton className="h-[20px] w-full rounded-lg" />
                             <Skeleton className="h-[250px] w-full rounded-xl" />
                        </div>
                    </div>
                )}
                {!loading && !charts && !error && (
                     <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Ready for Insights?</AlertTitle>
                        <AlertDescription>
                            Click the &quot;Generate Charts&quot; button to get started. Our AI will analyze your budget and expenses to create insightful charts.
                        </AlertDescription>
                    </Alert>
                )}
                {charts && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {charts.map((config, index) => (
                             <Card key={index} className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-base">{config.options.title}</CardTitle>
                                    <CardDescription className="text-xs">{config.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderChart(config, index)}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

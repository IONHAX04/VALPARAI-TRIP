"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getMembers, getExpenses } from '@/lib/data';
import type { Member, Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface MemberContribution extends Member {
    totalSpent: number;
    expenses: Expense[];
}

export default function SummaryPage() {
    const [contributions, setContributions] = useState<MemberContribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [members, expenses] = await Promise.all([getMembers(), getExpenses()]);

                const memberContributions = members.map(member => {
                    const memberExpenses = expenses.filter(expense => expense.memberId === member.id);
                    const totalSpent = memberExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                    return {
                        ...member,
                        totalSpent,
                        expenses: memberExpenses,
                    };
                });
                
                // Sort by total spent descending
                memberContributions.sort((a, b) => b.totalSpent - a.totalSpent);

                setContributions(memberContributions);
            } catch (error) {
                toast({ title: 'Error', description: 'Could not fetch summary data.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);


    if (isLoading) {
        return (
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Expense Summary</CardTitle>
                    <CardDescription>A summary of total expenses contributed by each member.</CardDescription>
                </CardHeader>
                <CardContent>
                    {contributions.length === 0 ? (
                         <div className="h-48 flex items-center justify-center text-muted-foreground">
                            No contributions have been made yet.
                        </div>
                    ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {contributions.map(member => (
                            <AccordionItem value={member.id} key={member.id}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-4 w-full pr-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{member.name}</div>
                                            <div className="text-sm text-muted-foreground">{member.role}</div>
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            ₹{member.totalSpent.toLocaleString()}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    {member.expenses.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Purpose</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {member.expenses.map(expense => (
                                                    <TableRow key={expense.id}>
                                                        <TableCell>{expense.purpose}</TableCell>
                                                        <TableCell>{new Date(expense.timestamp).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4 px-4">
                                            This member has not logged any expenses.
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

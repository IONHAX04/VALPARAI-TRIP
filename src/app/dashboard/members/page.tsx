"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Member, Expense } from '@/lib/types';
import { getMockMembers, MOCK_EXPENSES } from '@/lib/data';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(3, "Role must be at least 3 characters."),
});

const expenseSchema = z.object({
  memberId: z.string({ required_error: "Please select a member." }),
  amount: z.coerce.number().positive("Amount must be positive."),
  purpose: z.string().min(3, "Purpose must be at least 3 characters."),
});

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getMockMembers().then(setMembers);
    setExpenses(MOCK_EXPENSES);
  }, []);

  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", role: "" },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: 0, purpose: "" },
  });

  function onMemberSubmit(values: z.infer<typeof memberSchema>) {
    const newMember: Member = { id: `member${members.length + 1}`, ...values };
    setMembers(prev => [...prev, newMember]);
    toast({ title: "Member Added!", description: `${values.name} has been added to the trip.` });
    memberForm.reset();
  }

  function onExpenseSubmit(values: z.infer<typeof expenseSchema>) {
    const member = members.find(m => m.id === values.memberId);
    if (!member) return;
    const newExpense: Expense = {
      id: `exp${expenses.length + 1}`,
      ...values,
      memberName: member.name,
      timestamp: Timestamp.now(),
    };
    setExpenses(prev => [...prev, newExpense]);
    toast({ title: "Expense Added!", description: `₹${values.amount} for ${values.purpose} has been logged.` });
    expenseForm.reset();
    setIsExpenseDialogOpen(false);
  }

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
            <CardDescription>Add a new participant to the trip.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...memberForm}>
              <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
                <FormField control={memberForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={memberForm.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="e.g., Organizer" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members List</CardTitle>
            <CardDescription>All participants of the trip.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.id}><TableCell>{member.name}</TableCell><TableCell>{member.role}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Expense Log</CardTitle>
                <CardDescription>A record of all money spent.</CardDescription>
            </div>
             <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Wallet className="mr-2 h-4 w-4" /> Add Expense</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log a New Expense</DialogTitle>
                        <DialogDescription>Record a payment made by a team member.</DialogDescription>
                    </DialogHeader>
                    <Form {...expenseForm}>
                        <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                            <FormField control={expenseForm.control} name="memberId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {members.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={expenseForm.control} name="amount" render={({ field }) => (
                                <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={expenseForm.control} name="purpose" render={({ field }) => (
                                <FormItem><FormLabel>Purpose</FormLabel><FormControl><Input placeholder="e.g., Groceries" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Log Expense</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Purpose</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {expenses.sort((a,b) => b.timestamp.toMillis() - a.timestamp.toMillis()).map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.memberName}</TableCell>
                  <TableCell>{expense.purpose}</TableCell>
                  <TableCell>{expense.timestamp.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

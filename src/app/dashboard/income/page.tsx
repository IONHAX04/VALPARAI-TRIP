"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Member, Income } from '@/lib/types';
import { getMembers, getIncomes, addIncome, updateIncome, deleteIncome } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const incomeSchema = z.object({
  memberId: z.string({ required_error: "Please select a member." }),
  amount: z.coerce.number().positive("Amount must be positive."),
  purpose: z.string().min(3, "Purpose must be at least 3 characters."),
});

export default function IncomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(true);

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  
  const { toast } = useToast();

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
        const data = await getMembers();
        setMembers(data);
    } catch(e) {
        toast({ title: 'Error', description: 'Could not fetch members', variant: 'destructive' });
    } finally {
        setIsLoadingMembers(false);
    }
  }

  const fetchIncomes = async () => {
      setIsLoadingIncomes(true);
      try {
          const data = await getIncomes();
          setIncomes(data);
      } catch (e) {
          toast({ title: 'Error', description: 'Could not fetch incomes', variant: 'destructive' });
      } finally {
          setIsLoadingIncomes(false);
      }
  }

  useEffect(() => {
    fetchMembers();
    fetchIncomes();
  }, []);

  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { memberId: "", amount: 0, purpose: "" },
  });
  
  useEffect(() => {
    if (editingIncome) {
      incomeForm.reset({
        memberId: editingIncome.memberId,
        amount: editingIncome.amount,
        purpose: editingIncome.purpose,
      });
    } else {
      incomeForm.reset({ memberId: "", amount: 0, purpose: "" });
    }
  }, [editingIncome, incomeForm]);

  async function onIncomeSubmit(values: z.infer<typeof incomeSchema>) {
    const member = members.find(m => m.id === values.memberId);
    if (!member) return;

    const incomeData = { ...values, memberName: member.name };
    try {
        if (editingIncome) {
            await updateIncome(editingIncome.id, incomeData);
            toast({ title: "Income Updated!", description: `Income for ${values.purpose} has been updated.` });
        } else {
            await addIncome(incomeData);
            toast({ title: "Income Added!", description: `₹${values.amount} for ${values.purpose} has been logged.` });
        }
        fetchIncomes();
        setIsIncomeDialogOpen(false);
        setEditingIncome(null);
    } catch(e) {
        toast({ title: "Error", description: "Could not save income.", variant: "destructive"});
    }
  }

  function handleEditIncome(income: Income) {
    setEditingIncome(income);
    setIsIncomeDialogOpen(true);
  }

  async function handleDeleteIncome(incomeId: string) {
    try {
        await deleteIncome(incomeId);
        toast({ title: "Income Deleted", variant: 'destructive' });
        fetchIncomes();
    } catch(e) {
        toast({ title: "Error", description: "Could not delete income.", variant: 'destructive' });
    }
  }

  const incomeDialogContent = (
     <DialogContent>
        <DialogHeader>
            <DialogTitle>{editingIncome ? "Edit Income" : "Log a New Income"}</DialogTitle>
            <DialogDescription>{editingIncome ? "Update the income details." : "Record income received from a team member."}</DialogDescription>
        </DialogHeader>
        <Form {...incomeForm}>
            <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="space-y-4">
                <FormField control={incomeForm.control} name="memberId" render={({ field }) => (
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
                <FormField control={incomeForm.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={incomeForm.control} name="purpose" render={({ field }) => (
                    <FormItem><FormLabel>Purpose</FormLabel><FormControl><Input placeholder="e.g., Initial Contribution" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsIncomeDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingIncome ? 'Save Changes' : 'Log Income'}</Button>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
  )

  return (
    <div className="grid gap-6">
         <Dialog open={isIncomeDialogOpen} onOpenChange={open => { setIsIncomeDialogOpen(open); if (!open) setEditingIncome(null); }}>
            {incomeDialogContent}
        </Dialog>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Income Log</CardTitle>
                <CardDescription>A record of all money received.</CardDescription>
            </div>
            <Button onClick={() => { setEditingIncome(null); setIsIncomeDialogOpen(true); }}><TrendingUp className="mr-2 h-4 w-4" /> Add Income</Button>
        </CardHeader>
        <CardContent>
        {isLoadingIncomes || isLoadingMembers ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Purpose</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No income logged yet.</TableCell></TableRow>
              ) : incomes.map(income => (
                <TableRow key={income.id}>
                  <TableCell>{income.memberName}</TableCell>
                  <TableCell>{income.purpose}</TableCell>
                  <TableCell>{new Date(income.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>₹{income.amount.toLocaleString()}</TableCell>
                   <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditIncome(income)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this income record.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteIncome(income.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

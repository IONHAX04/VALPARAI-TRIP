"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Wallet, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Member, Expense } from '@/lib/types';
import { getMembers, addMember, updateMember, deleteMember, getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
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

  const fetchExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
          const data = await getExpenses();
          setExpenses(data);
      } catch (e) {
          toast({ title: 'Error', description: 'Could not fetch expenses', variant: 'destructive' });
      } finally {
          setIsLoadingExpenses(false);
      }
  }

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  }, []);

  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", role: "" },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { memberId: "", amount: 0, purpose: "" },
  });
  
  useEffect(() => {
    if (editingMember) {
      memberForm.reset(editingMember);
    } else {
      memberForm.reset({ name: "", role: "" });
    }
  }, [editingMember, memberForm]);

  useEffect(() => {
    if (editingExpense) {
      expenseForm.reset({
        memberId: editingExpense.memberId,
        amount: editingExpense.amount,
        purpose: editingExpense.purpose,
      });
    } else {
      expenseForm.reset({ memberId: "", amount: 0, purpose: "" });
    }
  }, [editingExpense, expenseForm]);

  async function onMemberSubmit(values: z.infer<typeof memberSchema>) {
    try {
        if (editingMember) {
            await updateMember(editingMember.id, values);
            toast({ title: "Member Updated!", description: `${values.name} has been updated.` });
        } else {
            await addMember(values);
            toast({ title: "Member Added!", description: `${values.name} has been added to the trip.` });
        }
        fetchMembers();
        setIsMemberDialogOpen(false);
        setEditingMember(null);
    } catch(e) {
        toast({ title: "Error", description: "Could not save member.", variant: "destructive"})
    }
  }

  function handleEditMember(member: Member) {
    setEditingMember(member);
    setIsMemberDialogOpen(true);
  }

  async function handleDeleteMember(memberId: string) {
    try {
        await deleteMember(memberId);
        toast({ title: "Member Deleted", variant: 'destructive' });
        fetchMembers();
    } catch (e) {
        toast({ title: "Error", description: "Could not delete member.", variant: 'destructive'});
    }
  }

  async function onExpenseSubmit(values: z.infer<typeof expenseSchema>) {
    const member = members.find(m => m.id === values.memberId);
    if (!member) return;

    const expenseData = { ...values, memberName: member.name };
    try {
        if (editingExpense) {
            await updateExpense(editingExpense.id, expenseData);
            toast({ title: "Expense Updated!", description: `Expense for ${values.purpose} has been updated.` });
        } else {
            await addExpense(expenseData);
            toast({ title: "Expense Added!", description: `₹${values.amount} for ${values.purpose} has been logged.` });
        }
        fetchExpenses();
        setIsExpenseDialogOpen(false);
        setEditingExpense(null);
    } catch(e) {
        toast({ title: "Error", description: "Could not save expense.", variant: "destructive"});
    }
  }

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  }

  async function handleDeleteExpense(expenseId: string) {
    try {
        await deleteExpense(expenseId);
        toast({ title: "Expense Deleted", variant: 'destructive' });
        fetchExpenses();
    } catch(e) {
        toast({ title: "Error", description: "Could not delete expense.", variant: 'destructive' });
    }
  }

  const memberDialogContent = (
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
            <DialogDescription>{editingMember ? "Update the member's details." : "Add a new participant to the trip."}</DialogDescription>
        </DialogHeader>
        <Form {...memberForm}>
            <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
            <FormField control={memberForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={memberForm.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="e.g., Organizer" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsMemberDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingMember ? "Save Changes" : "Add Member"}</Button>
            </DialogFooter>
            </form>
        </Form>
    </DialogContent>
  );

  const expenseDialogContent = (
     <DialogContent>
        <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Log a New Expense"}</DialogTitle>
            <DialogDescription>{editingExpense ? "Update the expense details." : "Record a payment made by a team member."}</DialogDescription>
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
                    <Button type="button" variant="ghost" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingExpense ? 'Save Changes' : 'Log Expense'}</Button>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
  )

  return (
    <div className="grid gap-6">
        <Dialog open={isMemberDialogOpen} onOpenChange={open => { setIsMemberDialogOpen(open); if (!open) setEditingMember(null); }}>
            {memberDialogContent}
        </Dialog>
         <Dialog open={isExpenseDialogOpen} onOpenChange={open => { setIsExpenseDialogOpen(open); if (!open) setEditingExpense(null); }}>
            {expenseDialogContent}
        </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Members List</CardTitle>
                <CardDescription>All participants of the trip.</CardDescription>
            </div>
            <Button onClick={() => { setEditingMember(null); setIsMemberDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
        </CardHeader>
        <CardContent>
        {isLoadingMembers ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
        <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
            {members.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No members added yet.</TableCell></TableRow>
            ) : members.map(member => (
                <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditMember(member)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {member.name}.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Expense Log</CardTitle>
                <CardDescription>A record of all money spent.</CardDescription>
            </div>
            <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }}><Wallet className="mr-2 h-4 w-4" /> Add Expense</Button>
        </CardHeader>
        <CardContent>
        {isLoadingExpenses ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Purpose</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No expenses logged yet.</TableCell></TableRow>
              ) : expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.memberName}</TableCell>
                  <TableCell>{expense.purpose}</TableCell>
                  <TableCell>{expense.timestamp.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                   <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this expense record.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>Delete</AlertDialogAction>
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

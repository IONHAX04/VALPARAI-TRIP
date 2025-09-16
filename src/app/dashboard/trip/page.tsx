"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TripDay } from '@/lib/types';
import { getTripDays, addTripDay, updateTripDay, deleteTripDay } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const tripDaySchema = z.object({
  dayName: z.string().min(3, "Day title must be at least 3 characters."),
  date: z.date({
    required_error: "A date is required.",
  }),
  places: z.string().min(3, "Places must be at least 3 characters."),
  budget: z.coerce.number().min(0, "Budget must be a positive number."),
});

export default function TripPage() {
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTripDay, setEditingTripDay] = useState<TripDay | null>(null);
  const { toast } = useToast();

  const fetchTripDays = async () => {
    setIsLoading(true);
    try {
      const days = await getTripDays();
      setTripDays(days);
    } catch (error) {
      toast({ title: "Error fetching trip days", description: "Could not load trip itinerary.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDays();
  }, []);
  
  const form = useForm<z.infer<typeof tripDaySchema>>({
    resolver: zodResolver(tripDaySchema),
    defaultValues: { dayName: "", places: "", budget: 0, date: undefined },
  });

   useEffect(() => {
    if (editingTripDay) {
      form.reset({
        dayName: editingTripDay.dayName,
        date: new Date(editingTripDay.date),
        places: editingTripDay.places,
        budget: editingTripDay.budget,
      });
    } else {
      form.reset({ dayName: "", places: "", budget: 0, date: undefined });
    }
  }, [editingTripDay, form]);


  async function onSubmit(values: z.infer<typeof tripDaySchema>) {
    setIsSubmitting(true);
     try {
        if (editingTripDay) {
          await updateTripDay(editingTripDay.id, values);
          toast({ title: "Trip Day Updated!", description: `Successfully updated plan for ${values.date.toLocaleDateString()}.` });
        } else {
          await addTripDay(values);
          toast({ title: "Trip Day Added!", description: `Successfully added plan for ${values.date.toLocaleDateString()}.` });
        }
        await fetchTripDays();
        setIsDialogOpen(false);
        setEditingTripDay(null);
        form.reset();
     } catch (error) {
        toast({ title: "Submission Error", description: "Failed to save trip day.", variant: "destructive" });
     } finally {
        setIsSubmitting(false);
     }
  }

  async function handleDeleteTripDay(tripDayId: string) {
    try {
        await deleteTripDay(tripDayId);
        toast({ title: "Trip Day Deleted", description: "The trip day has been removed.", variant: "destructive" });
        await fetchTripDays();
    } catch (error) {
        toast({ title: "Delete Error", description: "Failed to delete trip day.", variant: "destructive" });
    }
  }

  function handleEditClick(day: TripDay) {
    setEditingTripDay(day);
    setIsDialogOpen(true);
  }

  function handleAddClick() {
    setEditingTripDay(null);
    form.reset({ dayName: "", places: "", budget: 0, date: undefined });
    setIsDialogOpen(true);
  }
  
  const closeDialog = () => {
      setIsDialogOpen(false);
      setEditingTripDay(null);
  }

  const TripDayForm = (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="dayName"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Day Title</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Day 1: Arrival" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                      <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                          >
                          {field.value ? (
                              format(field.value, "PPP")
                          ) : (
                              <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                      </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                      />
                      </PopoverContent>
                  </Popover>
                  <FormMessage />
                  </FormItem>
              )}
              />
              <FormField
                  control={form.control}
                  name="places"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Places to Visit</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Tea Estates, Nirar Dam" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Budget (₹)</FormLabel>
                          <FormControl>
                              <Input type="number" placeholder="e.g., 1500" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : (editingTripDay ? 'Save Changes' : 'Add Day')}
                  </Button>
              </DialogFooter>
          </form>
      </Form>
  )

  return (
    <div className="grid gap-6">
        <div className="flex justify-end">
             <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" /> Add Trip Day</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) closeDialog(); else setIsDialogOpen(true); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingTripDay ? 'Edit Trip Day' : 'Add Trip Day'}</DialogTitle>
                    <DialogDescription>
                        {editingTripDay ? 'Update the details for this trip day.' : 'Plan a new day for your trip. Add places to visit and a budget.'}
                    </DialogDescription>
                </DialogHeader>
                {TripDayForm}
            </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Trip Itinerary</CardTitle>
          <CardDescription>Here is your currently planned trip schedule.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
           ) : (
            <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Places</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tripDays.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No trip days planned yet.</TableCell>
                            </TableRow>
                        ) : tripDays.map((day) => (
                        <TableRow key={day.id}>
                            <TableCell className="font-semibold">{day.dayName}</TableCell>
                            <TableCell>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                            <TableCell>{day.places}</TableCell>
                            <TableCell>₹{day.budget.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(day)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the trip day.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTripDay(day.id)}>Delete</AlertDialogAction>
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

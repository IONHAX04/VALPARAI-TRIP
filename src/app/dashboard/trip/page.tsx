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
import { getMockTripDays } from '@/lib/data';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const tripDaySchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  places: z.string().min(3, "Places must be at least 3 characters."),
  budget: z.coerce.number().min(0, "Budget must be a positive number."),
});

export default function TripPage() {
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [isAddTripDayDialogOpen, setAddTripDayDialogOpen] = useState(false);
  const [isEditTripDayDialogOpen, setEditTripDayDialogOpen] = useState(false);
  const [editingTripDay, setEditingTripDay] = useState<TripDay | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getMockTripDays().then(setTripDays);
  }, []);
  
  const form = useForm<z.infer<typeof tripDaySchema>>({
    resolver: zodResolver(tripDaySchema),
    defaultValues: {
      places: "",
      budget: 0,
    },
  });

   useEffect(() => {
    if (editingTripDay) {
      form.reset({
        date: editingTripDay.date.toDate(),
        places: editingTripDay.places,
        budget: editingTripDay.budget,
      });
    } else {
      form.reset({ places: "", budget: 0, date: undefined });
    }
  }, [editingTripDay, form]);


  function onSubmit(values: z.infer<typeof tripDaySchema>) {
     if (editingTripDay) {
      // In a real app, you would update this in Firestore
      const updatedDay: TripDay = { ...editingTripDay, ...values, date: Timestamp.fromDate(values.date) };
      setTripDays(prev => prev.map(d => d.id === updatedDay.id ? updatedDay : d).sort((a,b) => a.date.toMillis() - b.date.toMillis()));
      toast({ title: "Trip Day Updated!", description: `Successfully updated plan for ${values.date.toLocaleDateString()}.` });
      setEditTripDayDialogOpen(false);
      setEditingTripDay(null);
    } else {
      // In a real app, you would save this to Firestore
      const newDay: TripDay = {
          id: `day${tripDays.length + 1}`,
          ...values,
          date: Timestamp.fromDate(values.date)
      };
      setTripDays(prev => [...prev, newDay].sort((a,b) => a.date.toMillis() - b.date.toMillis()));
      toast({
        title: "Trip Day Added!",
        description: `Successfully added plan for ${values.date.toLocaleDateString()}.`,
      });
      setAddTripDayDialogOpen(false);
    }
    form.reset();
  }

  function handleDeleteTripDay(tripDayId: string) {
    setTripDays(prev => prev.filter(day => day.id !== tripDayId));
    toast({
        title: "Trip Day Deleted",
        description: "The trip day has been removed from your itinerary.",
        variant: "destructive"
    });
  }

  function handleEditClick(day: TripDay) {
    setEditingTripDay(day);
    setEditTripDayDialogOpen(true);
  }

  const TripDayForm = (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              <Input placeholder="e.g., Tea Estates, Nirar Dam" {...field} />
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
                              <Input type="number" placeholder="e.g., 1500" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <DialogFooter>
                  <Button type="submit">
                      {editingTripDay ? 'Save Changes' : 'Add Day'}
                  </Button>
              </DialogFooter>
          </form>
      </Form>
  )

  return (
    <div className="grid gap-6">
        <div className="flex justify-end">
            <Dialog open={isAddTripDayDialogOpen} onOpenChange={setAddTripDayDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingTripDay(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Trip Day</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Trip Day</DialogTitle>
                        <DialogDescription>Plan a new day for your trip. Add places to visit and a budget.</DialogDescription>
                    </DialogHeader>
                    {TripDayForm}
                </DialogContent>
            </Dialog>
        </div>

        <Dialog open={isEditTripDayDialogOpen} onOpenChange={(open) => { setEditTripDayDialogOpen(open); if(!open) setEditingTripDay(null)}}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Trip Day</DialogTitle>
                    <DialogDescription>Update the details for this trip day.</DialogDescription>
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
                    {tripDays.map((day, index) => (
                    <TableRow key={day.id}>
                        <TableCell className="font-semibold">Day {index + 1}</TableCell>
                        <TableCell>{day.date.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}

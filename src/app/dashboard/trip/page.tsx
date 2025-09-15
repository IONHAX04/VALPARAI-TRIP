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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TripDay } from '@/lib/types';
import { getMockTripDays } from '@/lib/data';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const tripDaySchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  places: z.string().min(3, "Places must be at least 3 characters."),
  budget: z.coerce.number().min(0, "Budget must be a positive number."),
});

export default function TripPage() {
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
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

  function onSubmit(values: z.infer<typeof tripDaySchema>) {
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
    form.reset();
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Add Trip Day</CardTitle>
                <CardDescription>Plan a new day for your trip. Add places to visit and a budget.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
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
                        <Button type="submit" className="self-end">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Day
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
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
                    <TableHead className="text-right">Budget</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tripDays.map((day, index) => (
                    <TableRow key={day.id}>
                        <TableCell className="font-semibold">Day {index + 1}</TableCell>
                        <TableCell>{day.date.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                        <TableCell>{day.places}</TableCell>
                        <TableCell className="text-right">₹{day.budget.toLocaleString()}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

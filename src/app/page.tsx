import { getDashboardData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default async function PublicDashboard() {
  const data = await getDashboardData();

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const memberContributions = data.members.map(member => {
    const contributions = data.expenses.filter(e => e.memberId === member.id);
    const total = contributions.reduce((sum, e) => sum + e.amount, 0);
    return { ...member, total };
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Logo />
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <p className="text-sm text-muted-foreground ml-auto">Public Read-Only View</p>
          <Button asChild>
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Budget</CardTitle>
              <span className="text-muted-foreground">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.overallBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total planned budget for the trip</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
               <span className="text-muted-foreground">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sum of all contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              <span className="text-muted-foreground">📊</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.remainingBudget < 0 ? 'text-destructive' : 'text-primary'}`}>
                ₹{data.remainingBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.remainingBudget < 0 ? 'Over budget' : 'Funds available'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
               <span className="text-muted-foreground">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.members.length}</div>
              <p className="text-xs text-muted-foreground">Total trip participants</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Plan</CardTitle>
                <CardDescription>Overview of the planned trip days.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Places</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.tripDays.length === 0 ? (
                           <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No trip days planned yet.</TableCell>
                            </TableRow>
                        ) : data.tripDays.map((day, index) => (
                        <TableRow key={day.id}>
                            <TableCell>
                            <div className="font-medium">Day {index + 1}</div>
                            <div className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>{day.places}</TableCell>
                            <TableCell className="text-right">₹{day.budget.toLocaleString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Individual Contributions</CardTitle>
                 <CardDescription>Total amount contributed by each member.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberContributions.length === 0 ? (
                       <p className="text-center text-muted-foreground py-10">No members have contributed yet.</p>
                  ) : memberContributions.map(member => (
                    <div key={member.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                         <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="ml-auto font-medium">₹{member.total.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

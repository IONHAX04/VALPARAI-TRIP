import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Expense } from "@/lib/types";

interface RecentExpensesProps {
    expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
    const recentExpenses = [...expenses].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()).slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>A log of the most recent contributions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentExpenses.map(expense => (
                            <TableRow key={expense.id}>
                                <TableCell>
                                    <div className="font-medium">{expense.memberName}</div>
                                    <div className="text-sm text-muted-foreground">{expense.timestamp.toDate().toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell>{expense.purpose}</TableCell>
                                <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

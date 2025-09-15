import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: string;
    type?: 'currency' | 'number';
    isNegative?: boolean;
}

export default function StatCard({ title, value, description, icon, type = 'number', isNegative = false }: StatCardProps) {
    const formattedValue = type === 'currency' ? `₹${value.toLocaleString()}` : value.toLocaleString();
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <span className="text-muted-foreground">{icon}</span>
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", isNegative && 'text-destructive')}>
                    {formattedValue}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

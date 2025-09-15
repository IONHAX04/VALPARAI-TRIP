"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bgImage = PlaceHolderImages.find(img => img.id === 'valparai-trip');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="space-y-1 text-center">
             <div className="flex justify-center mb-4">
                <Logo />
             </div>
            <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
               {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="px-8 text-center text-sm text-muted-foreground">
                This is a private app. Public users can only view the main page.
            </p>
          </CardFooter>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        {bgImage && (
             <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                data-ai-hint={bgImage.imageHint}
                width="1920"
                height="1080"
                className="h-full w-full object-cover"
            />
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { isAuthenticated } from '@/lib/auth';
import { ArrowRight, Bot, PartyPopper } from 'lucide-react';

export default function PricingSuccess() {
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="size-4" aria-hidden />
            </span>
            GreAgents
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            {authed ? (
              <Button asChild size="default">
                <Link to="/dashboard">
                  Dashboard
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="default">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-20 md:py-28">
        <Card className="border-border/80 bg-card/80 shadow-lg">
          <CardHeader className="gap-3 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
              <PartyPopper className="size-6" aria-hidden />
            </div>
            <CardTitle className="text-2xl">You are almost there</CardTitle>
            <CardDescription className="text-base">
              If you completed checkout on Dodo, your subscription will show up in your workspace
              shortly. You can head back to the app whenever you are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {authed ? (
              <Button asChild className="w-full sm:w-auto">
                <Link to="/dashboard">
                  Open dashboard
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/pricing">Back to pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

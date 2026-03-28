import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isAuthenticated } from '@/lib/auth';
import {
  ArrowRight,
  Binary,
  Bot,
  Code,
  FileCheck,
  GitBranch,
  Orbit,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

export default function Landing() {
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

      <main>
        <section className="relative isolate border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
            <div className="absolute -left-16 top-32 h-56 w-56 rounded-full bg-chart-2/15 blur-3xl" />
            <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-chart-1/10 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="size-3.5" aria-hidden />
                  Agent provisioning for codebases with ambition and mild chaos
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  Quietly scheming in your repo
                </div>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Ship faster with repo-native agents, odd little gremlins with excellent follow-through
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground md:text-xl">
                GreAgents connects specialized AI agents to your GitHub workflow. Open an issue,
                get a pull request. Request a review, get structured feedback. Less tab pinball,
                fewer copy-paste rituals, more useful mischief.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {authed ? (
                  <Button asChild size="lg" className="h-10 px-5 text-sm shadow-lg shadow-primary/20">
                    <Link to="/dashboard">
                      Open dashboard
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="h-10 px-5 text-sm shadow-lg shadow-primary/20">
                    <Link to="/login">
                      Get started
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 border-border/80 bg-background/60 px-5 text-sm backdrop-blur-sm"
                  asChild
                >
                  <a href="#agents">Explore agents</a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 border-border/80 bg-background/40 px-5 text-sm backdrop-blur-sm"
                  asChild
                >
                  <Link to="/pricing">See pricing</Link>
                </Button>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <GitBranch className="size-3.5" aria-hidden />
                    Flow
                  </div>
                  <p className="mt-2 text-sm font-medium">Issue in, branch out, paperwork evaporates.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <Orbit className="size-3.5" aria-hidden />
                    Mood
                  </div>
                  <p className="mt-2 text-sm font-medium">Sharp, useful, and allergic to beige SaaS energy.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <Zap className="size-3.5" aria-hidden />
                    Outcome
                  </div>
                  <p className="mt-2 text-sm font-medium">More building, fewer ceremonial clicks.</p>
                </div>
              </div>
            </div>

            <div className="relative pt-16 lg:px-6 lg:pt-8">
              <div className="absolute left-6 top-0 z-20 hidden max-w-[16rem] -rotate-3 rounded-2xl border border-chart-2/40 bg-chart-2/12 px-3 py-2 text-xs font-medium text-chart-2 shadow-lg shadow-black/20 backdrop-blur-sm lg:block">
                reviewer: "this function has theatre kid energy"
              </div>
              <div className="absolute bottom-10 right-0 z-20 hidden translate-x-5 rotate-2 rounded-2xl border border-chart-1/40 bg-chart-1/12 px-3 py-2 text-xs font-medium text-chart-1 shadow-lg shadow-black/20 backdrop-blur-sm lg:block">
                coder opened PR before coffee cooled
              </div>

              <Card className="relative z-10 overflow-hidden border-border/70 bg-card/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
                <CardHeader className="gap-4 border-b border-border/70 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-xl">Command center, but with a pulse</CardTitle>
                      <CardDescription>
                        A tiny status board for your helpful little code goblins.
                      </CardDescription>
                    </div>
                    <div className="shrink-0 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs leading-none text-muted-foreground">
                      somewhat alive
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      Repo shenanigans
                    </div>
                    <div className="space-y-3 font-mono text-xs text-muted-foreground">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                        <span className="truncate">issue #1842</span>
                        <span className="justify-self-end text-right text-foreground">claimed by coder</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                        <span className="truncate">pr #811</span>
                        <span className="justify-self-end text-right text-foreground">reviewer delivered 4 opinions</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                        <span className="truncate">release prep</span>
                        <span className="justify-self-end text-right text-foreground">
                          adult supervision still required
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-primary/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Binary className="size-4 text-primary" aria-hidden />
                        Coder
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Turns backlog dread into a branch, a diff, and a suspiciously prompt PR.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-chart-2/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Star className="size-4 text-chart-2" aria-hidden />
                        Reviewer
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Reads the diff like a picky teammate who still says please and thank you.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                    No fake charts, no executive fog machine. Just enough weirdness to feel alive,
                    and enough structure to actually help.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="agents" className="scroll-mt-20 border-b border-border/60 bg-muted/20">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
            <div className="flex flex-col gap-3 md:max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Agents you can run today</h2>
              <p className="text-muted-foreground">
                Each agent is built for a concrete job in your delivery loop. Provision them from
                the dashboard and point them at the repos currently haunting your sprint board.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/80 bg-card/80 shadow-none transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Code className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">Coder</CardTitle>
                  <CardDescription>
                    Turn a tracked issue into implementation. The agent works the branch and opens
                    a pull request, so your team can review code instead of summoning it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <GitBranch className="size-3.5 shrink-0" aria-hidden />
                    Issue → PR
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/80 shadow-none transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileCheck className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">Reviewer</CardTitle>
                  <CardDescription>
                    Automated review passes over diffs and summaries: catch risks, suggest
                    improvements, and apply tasteful skepticism before humans sign off.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <FileCheck className="size-3.5 shrink-0" aria-hidden />
                    Diff-aware feedback
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-border/80 bg-linear-to-br from-muted/40 to-background shadow-none">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Bot className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">More soon</CardTitle>
                  <CardDescription>
                    We are expanding the agent library for planning, testing, docs, and release
                    hygiene. More odd specialists are on the way.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" aria-hidden />
                    Tiny menace, scaling politely
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
            <div className="flex flex-col gap-2 md:max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Ready to provision your first agent?
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in with GitHub, connect your organization, and let the tasteful automation
                begin.
              </p>
            </div>
            {authed ? (
              <Button asChild size="lg" className="h-10 shrink-0 px-5 text-sm">
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-10 shrink-0 px-5 text-sm">
                <Link to="/login">
                  Log in with GitHub
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GreAgents. Useful automation for teams with deadlines and opinions.
          </p>
          <Separator className="md:hidden" />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="text-foreground/80">Coder</span>
            <span className="text-foreground/80">Reviewer</span>
            <span>Roadmap: more delightful weirdos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

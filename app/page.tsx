import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">ShiftSync</h1>
        <p className="text-xl text-muted-foreground">
          Autonomous Workforce Orchestration
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/manager">
          <Button size="lg">Manager Dashboard</Button>
        </Link>
        <Button size="lg" variant="outline">
          Worker App (Mobile)
        </Button>
      </div>
    </div>
  );
}

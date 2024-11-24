import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StartPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Lapse: A Forgotten Future
          </CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Shape the destiny of a post-apocalyptic world
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            In the year 2075, you are the governor of a struggling community in
            a world ravaged by nuclear war. Your decisions will shape the future
            of your people and the world around you.
          </p>
          <p>
            Balance the needs of nature, society, military, and economy as you
            navigate through challenging scenarios. Will you lead your people to
            prosperity or doom?
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/game">Start Game</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

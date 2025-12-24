import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";

import { summarizeCommunityDiscussion } from "../../services/communityDiscussion";
import { DUMMY_DISCUSSION } from "../../data/data";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function CommunitySummary() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = () => {
    startTransition(async () => {
      setError(null);
      setSummary(null);

      try {
        const result = await summarizeCommunityDiscussion({
          discussionText: DUMMY_DISCUSSION,
          communityName: "College-Wide",
        });

        if (result?.summary) {
          setSummary(result.summary);
        } else {
          setError("Failed to generate summary. The result was empty.");
        }
      } catch (err) {
        console.error(err);
        setError(
          "An error occurred while generating the summary. Please try again."
        );
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-primary">
            AI Discussion Summary
          </CardTitle>
        </div>
        <CardDescription>
          Get a quick summary of what's trending in the community.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[10rem]">
        {isPending && (
          <div className="flex items-center justify-center space-x-2 p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Generating summary...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && (
          <p className="whitespace-pre-wrap text-sm text-foreground/80">
            {summary}
          </p>
        )}

        {!summary && !isPending && !error && (
          <div className="flex h-full items-center justify-center">
            <p className="py-4 text-center text-sm italic text-muted-foreground">
              Click the button to generate an AI summary of recent discussions.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleGenerateSummary}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardFooter>
    </Card>
  );
}

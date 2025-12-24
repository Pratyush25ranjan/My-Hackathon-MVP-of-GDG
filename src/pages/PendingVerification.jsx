import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { auth } from "../services/firebase";

export default function PendingVerification() {
  const navigate = useNavigate();

  const handleBackToLogin = async () => {
    await auth.signOut(); // 🔑 important
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            Verification Pending
          </CardTitle>
          <CardDescription>
            Thanks for signing up! Your account is currently under review.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="mb-6 text-muted-foreground">
            We are manually verifying your college ID to ensure the safety and
            authenticity of our community. This usually takes 24–48 hours.
            You’ll be notified once approved.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

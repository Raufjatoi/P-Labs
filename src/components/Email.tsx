import React from "react";
import { Button } from "@/components/ui/button";

const Email = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">
          🎉 Your email is confirmed!
        </h1>
        <p className="mb-6 text-muted-foreground">
          Thank you for verifying your email address. You can now log in to your account.
        </p>
        <Button
          variant="default"
          size="lg"
          onClick={() => (window.location.href = "https://p-labs.vercel.app/auth")}
        >
          Go to Login
        </Button>
      </div>
    </section>
  );
};

export default Email;

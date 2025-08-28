import {
  createFileRoute,
  useNavigate
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/login")({
  ssr: false,
  component: LoginForm,
  validateSearch: searchSchema,
});

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { isPending } = authClient.useSession();
  const { queryClient } = Route.useRouteContext();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isSigningInWithNear, setIsSigningInWithNear] = useState(false);
  const [isDisconnectingWallet, setIsDisconnectingWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const accountId = authClient.near.getAccountId();

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    authClient.signIn.anonymous(undefined, {
      onError: (ctx) => {
        console.error("Anonymous sign in failed:", ctx);
        setIsLoading(false);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        navigate({ to: redirect || "/" });
      },
    });
  };

  const handleWalletConnect = async () => {
    setIsConnectingWallet(true);
    try {
      await authClient.requestSignIn.near(
        { recipient: "run.everything.near" },
        {
          onSuccess: () => {
            setIsConnectingWallet(false);
            toast.success(`Wallet connected`);
          },
          onError: (error: any) => {
            setIsConnectingWallet(false);
            console.error("Wallet connection failed:", error);
            const errorMessage =
              error.code === "SIGNER_NOT_AVAILABLE"
                ? "NEAR wallet not available"
                : error.message || "Failed to connect wallet";
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      setIsConnectingWallet(false);
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect to NEAR wallet");
    }
  };

  const handleNearSignIn = async () => {
    setIsSigningInWithNear(true);
    try {
      await authClient.signIn.near(
        { recipient: "run.everything.near" },
        {
          onSuccess: () => {
            setIsSigningInWithNear(false);
            navigate({
              to: redirect || "/dashboard",
              replace: true,
            });
            toast.success(`Signed in as: ${accountId}`);
          },
          onError: (error: unknown) => {
            setIsSigningInWithNear(false);
            console.error("NEAR sign in error:", error);

            if ((error as any)?.code === "NONCE_NOT_FOUND") {
              toast.error("Session expired. Please reconnect your wallet.");
              handleWalletDisconnect();
              return;
            }

            toast.error(
              error instanceof Error ? error.message : "Authentication failed"
            );
          },
        }
      );
    } catch (error) {
      setIsSigningInWithNear(false);
      console.error("NEAR sign in error:", error);

      if ((error as any)?.code === "NONCE_NOT_FOUND") {
        toast.error("Session expired. Please reconnect your wallet.");
        handleWalletDisconnect();
        return;
      }

      toast.error("Authentication failed");
    }
  };

  const handleWalletDisconnect = async () => {
    setIsDisconnectingWallet(true);
    try {
      await authClient.signOut();
      await authClient.near.disconnect();
      setIsDisconnectingWallet(false);
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      setIsDisconnectingWallet(false);
      console.error("Wallet disconnect error:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card border rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4">
            Sign in with NEAR
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Connect your NEAR wallet to authenticate securely
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {!accountId ? (
            <Button
              type="button"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
              onClick={handleWalletConnect}
              disabled={isConnectingWallet}
            >
              {isConnectingWallet
                ? "Connecting Wallet..."
                : "Connect NEAR Wallet"}
            </Button>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <Button
                type="button"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
                onClick={handleNearSignIn}
                disabled={isSigningInWithNear}
              >
                {isSigningInWithNear
                  ? "Signing in..."
                  : `Sign in with NEAR (${accountId})`}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
                onClick={handleWalletDisconnect}
                disabled={isDisconnectingWallet}
              >
                {isDisconnectingWallet
                  ? "Disconnecting..."
                  : "Disconnect Wallet"}
              </Button>
            </div>
          )}

          <Button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
            variant="outline"
          >
            {isLoading ? "Signing in..." : "Continue as Guest"}
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            This demo uses fastintear for wallet connectivity.
          </p>
        </div>
      </div>
    </div>
  );
}

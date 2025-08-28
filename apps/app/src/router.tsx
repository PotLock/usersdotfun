import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient } from "./utils/orpc";
import { QueryClientProvider } from "@tanstack/react-query";

export const createRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: { 
      // orpc,
      queryClient, user: null },
    defaultPendingComponent: () => <div>Loading...</div>,
    defaultNotFoundComponent: () => <NotFound />,
    defaultErrorComponent: DefaultCatchBoundary,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

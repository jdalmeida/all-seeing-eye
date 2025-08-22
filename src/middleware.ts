import { clerkMiddleware } from "@clerk/nextjs/server";

// This middleware will handle authentication for your application
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information
export default clerkMiddleware({});

export const config = {
	matcher: [
		// Skip Next.js internals and static files
		"/((?!_next/static|_next/image|favicon.ico).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};

import { NextRequest, NextResponse } from "next/server";

// Middleware to check if user is authenticated
export function middleware(request: NextRequest) {
  // Check cookies for access token
  const cookies = request.cookies
  const accessToken = cookies.get('access_token');

  if (accessToken) {
    // Token exists, proceed to the requested resource
    return NextResponse.next();
  } else {
    // Token does not exist, redirect to Spotify login
    console.log("no spotify token found, redirecting")

    const redirectUrl = new URL('/api/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ['/boilerplate/home', '/boilerplate/createsubtune', '/boilerplate/createplaylist', '/createSubtune'], // Routes to apply middleware
};

// app/not-found.tsx (Modified Content from NotFound.tsx)
// Next.js convention for a Not Found page
'use client'; 

// Removed: import { useLocation } from "react-router-dom";
// Removed: import { useEffect } from "react";

// For navigation, we'll use a basic anchor tag as in the original component, 
// which is acceptable for a simple 404 return link.

const NotFoundPage = () => {
  // Removed: const location = useLocation();
  // Removed: useEffect hook logging the 404 error

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
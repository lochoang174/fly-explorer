// import React from "react";
import { Outlet, useRoutes, Navigate } from "react-router-dom";

// Import components
// import Signin from "src/pages/auth/components/sign-in";
// import Signup from "src/pages/auth/components/sign-up";
// import Tasks from "src/pages/todo/components/task";
// import CompleteTasks from "src/pages/todo/components/complete-task";

// Import hooks
// import { useAuth } from "src/hooks/use-auth";

// Import layouts
import DashboardLayout from "src/layouts/dashboard";

// Import pages
// import AuthPage from "src/pages/auth";
import HomePage from "src/pages/home";
// import TodoPage from "src/pages/todo";

// Import utils
// import { CookieUtils } from "src/utils/cookies";

// Import types
import type { RouteObject } from "react-router-dom";
import GraphPage from "src/pages/graph";

export const AuthenticatedRoutesMetadata = new Map([
  ["/", import.meta.env.VITE_APP_NAME],
  ["/conversation", "Conversation"],
  ["/documents", "Documents"],
  ["/twitter", "Twitter"],
  ["/pitchdesk", "Pitchdesk"],
  ["/settings", "Settings"],
]);

// const unAuthenticatedRoutes: Array<RouteObject> = [
//   {
//     path: "/",
//     element: <AuthPage />,
//     children: [
//       {
//         path: "/sign-in",
//         element: <Signin />,
//       },
//       {
//         path: "/sign-up",
//         element: <Signup />,
//       },
//       {
//         path: "/",
//         element: <Navigate to="/sign-in" replace />,
//       },
//     ],
//   },
// ];

const rootRoutes: Array<RouteObject> = [
  {
    path: "/",
    element: (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    ),
    children: [
      {
        path: "/conversation",
        element: <HomePage />,
      },
      {
        path: "/graph",
        element: <GraphPage />,
      },
      {
        path: "/",
        element: <Navigate to="/conversation" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/conversation" />,
      }
    ],
  },
];

export default function RootRoutes() {
  return useRoutes(rootRoutes);
}

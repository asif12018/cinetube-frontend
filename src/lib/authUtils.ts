export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export const authRoutes = [ "/login", "/register", "/forgot-password", "/reset-password", "/verify-email" ,"/sendOtpVerification"];

export const isAuthRoute = (pathname : string) => {
    return authRoutes.some((router : string) => router === pathname);
}

export type RouteConfig = {
    exact : string[],
    pattern : RegExp[]
}

export const commonProtectedRoutes : RouteConfig = {
    exact : ["/my-profile", "/change-password", "/movie/:id"],
    pattern: [
        // 🟢 This regex matches any route that starts with /movie/ followed by an ID
        // But it ignores the base /movie route!
        /^\/movie\/[^\/]+(?:\/|$)/ 
    ]
}

export const userProtectedRoutes: RouteConfig = {
    pattern: [/^\/(watchList|subscription)(\/|$)/], 
    exact: []
};

export const adminProtectedRoutes: RouteConfig = {
    pattern: [/^\/dashboard(\/|$)/], 
    exact: []
};

// export const superAdminProtectedRoutes : RouteConfig = {
//     pattern: [/^\/admin\/dashboard/ ], // Matches any path that starts with /super-admin/dashboard
//     exact : []
// }



export const isRouteMatches = (pathname : string, routes : RouteConfig) => {
    if(routes.exact.includes(pathname)) {
        return true;
    }
    return routes.pattern.some((pattern : RegExp) => pattern.test(pathname));
}

export const getRouteOwner = (pathname : string) : "SUPER_ADMIN" | "ADMIN" | "USER" | "COMMON" | null => {
    if(isRouteMatches(pathname, userProtectedRoutes)) {
        return "USER"; // Fix: Changed from "DOCTOR"
    }

    if(isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }

    // Removed the duplicated adminProtectedRoutes check that returned "PATIENT"

    if(isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }

    return null; // public route
}

export const getDefaultDashboardRoute = (role : UserRole) => {
    if(role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/dashboard";
    }
    if(role === "USER") {
        return "/watchList";
    }
   

    return "/";
}

export const isValidRedirectForRole = (redirectPath : string, role : UserRole) => {
    const unifySuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;

    role = unifySuperAdminAndAdminRole;

    const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
    const routeOwner = getRouteOwner(sanitizedRedirectPath);

    if(routeOwner === null || routeOwner === "COMMON"){
        return true;
    }

    if(routeOwner === role){
        return true;
    }

    return false;
}
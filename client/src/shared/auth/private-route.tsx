import React from 'react';
import { useLocation, Navigate, PathRouteProps } from 'react-router-dom';

// import { useAppSelector } from 'app/config/store';
import ErrorBoundary from '../error/error-boundary'
import { GlobalStateContext } from '../../configs/global-state-provider';

interface IOwnProps extends PathRouteProps {
  hasAnyRoles?: string[];
  children: React.ReactNode;
}

export const PrivateRoute = ({ children, hasAnyRoles = [], ...rest }: IOwnProps) => {
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const isAuthenticated = React.useContext(GlobalStateContext).globalState?.isAuthenticated;
  const sessionFetched = React.useContext(GlobalStateContext).globalState?.sessionFetched;
  const isAuthorized = hasAnyRole(user?.role, hasAnyRoles);
  const location = useLocation();

  if (!children) {
    throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);
  }

  if (!sessionFetched) {
    return <div></div>;
  }

  if (isAuthenticated) {
    if (isAuthorized) {
      return <ErrorBoundary>{children}</ErrorBoundary>;
    }

    return (
      <div className="insufficient-authority">
        <div className="alert alert-danger">You are not authorized to access this page.</div>
      </div>
    );
  }

  return (
    <Navigate
      to={{
        pathname: '/login',
        search: location.search,
      }}
      replace
      state={{ from: location }}
    />
  );
};

export const hasAnyRole = (role: string | undefined, hasAnyRoles: string[]) => {
  if (role) {
    if (hasAnyRoles.length === 0) {
      return true;
    }
    return hasAnyRoles.some(r => role === r);
  }
  return false;
};

/**
 * Checks authentication before showing the children and redirects to the
 * login page if the user is not authenticated.
 * If hasAnyAuthorities is provided the authorization status is also
 * checked and an error message is shown if the user is not authorized.
 */
export default PrivateRoute;

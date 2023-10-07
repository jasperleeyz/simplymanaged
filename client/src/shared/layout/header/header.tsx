"use client";

import {
  Avatar,
  CustomFlowbiteTheme,
  Dropdown,
  Flowbite,
  Navbar,
} from "flowbite-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GlobalStateContext, InitialGlobalState } from "../../../configs/global-state-provider";
import { PATHS } from "../../../configs/constants";
import { capitalizeString, getHomeLink } from "../../../configs/utils";
import { ROLES } from "../../../configs/constants";

const customHeaderTheme: CustomFlowbiteTheme = {
  navbar: {
    root: {
      inner: {
        base: "mx-auto flex flex-wrap items-center justify-between max-w-6xl",
      },
    },
    collapse: {
      base: "w-full me-auto md:block md:w-auto",
    },
    link: {
      active: {
        // on: "bg-blue-700 text-white dark:text-white md:bg-transparent md:text-blue-700",
      },
    },
  },
};

const Header = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const location = useLocation();

  const signOut = () => {
    sessionStorage.removeItem("bearerToken");
    setGlobalState((prevState) => (InitialGlobalState));
  }

  return (
    <Flowbite theme={{ theme: customHeaderTheme }}>
      <Navbar fluid rounded className="border-b">
        <Navbar.Brand href={globalState?.isAuthenticated ? getHomeLink(globalState?.user?.role || "") : "/login"}>
          <img alt="SiM Logo" className="mr-3 h-12 sm:h-14" src="/logo.png" />
          {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          SimplyManaged
        </span> */}
        </Navbar.Brand>
        {globalState?.isAuthenticated && (
          <>
            <div className="flex md:order-2">
              <Dropdown
                inline
                arrowIcon={false}
                label={
                  <Avatar
                    alt="User settings"
                    img={globalState?.user?.profileImage}
                    rounded
                    className="mr-3"
                  />
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">
                    {capitalizeString(globalState?.user?.fullname)}
                  </span>
                  <span className="block truncate text-sm font-medium">
                    {globalState?.user?.email.toLowerCase()}
                  </span>
                </Dropdown.Header>
                <Dropdown.Item
                  className="font-normal"
                  as={Link}
                  to={`/${PATHS.MY_PROFILE}`}
                >
                  My profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => signOut()}>Sign out</Dropdown.Item>
              </Dropdown>
              <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
              {/*SUPERADMIN HEADER*/}
              {globalState?.user?.role == ROLES.SUPERADMIN && (
                <>
                  <Navbar.Link
                    active={location.pathname.startsWith("/" + PATHS.REGISTRATION)}
                    to={`/${PATHS.REGISTRATION}/${PATHS.VIEW_REGISTRATION}`}
                    as={Link}
                  >
                    Registrations
                  </Navbar.Link>
                  <Navbar.Link
                    active={location.pathname.startsWith("/" + PATHS.CODE)}
                    to={`/${PATHS.CODE}`}
                    as={Link}
                  >
                    Code Management
                  </Navbar.Link>
                </>
              )}

              {/*SYSADMIN HEADER*/}
              {globalState?.user?.role == ROLES.SYSADMIN && (
                <Navbar.Link
                  active={location.pathname.startsWith("/" + PATHS.EMPLOYEES)}
                  to={`/${PATHS.EMPLOYEES}`}
                  as={Link}
                >
                  People
                </Navbar.Link>
              )}

              {/* EMPLOYEE & MANAGER HEADER*/}
              {(globalState?.user?.role == ROLES.SCHEDULER ||
                globalState?.user?.role == ROLES.EMPLOYEE) && (
                <>
                  <Navbar.Link
                    active={location.pathname === "/"}
                    to="/"
                    as={Link}
                  >
                    <p>Dashboard</p>
                  </Navbar.Link>
                  <Navbar.Link
                    active={location.pathname.startsWith("/" + PATHS.SCHEDULE)}
                    to={`/${PATHS.SCHEDULE}`}
                    as={Link}
                  >
                    Schedule
                  </Navbar.Link>
                  <Navbar.Link
                    active={location.pathname.startsWith("/" + PATHS.REQUESTS)}
                    to={`/${PATHS.REQUESTS}`}
                    as={Link}
                  >
                    Requests
                  </Navbar.Link>
                </>
              )}
            </Navbar.Collapse>
          </>
        )}
      </Navbar>
    </Flowbite>
  );
};

export default Header;

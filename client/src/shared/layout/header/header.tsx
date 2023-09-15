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
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { PATHS } from "../../../configs/constants";
import { capitalizeString } from "../../../configs/utils";
import { ROLES } from "../../../configs/constants";

const customHeaderTheme: CustomFlowbiteTheme = {
  navbar: {
    root: {
        inner: {
            base: "mx-auto flex flex-wrap items-center justify-between max-w-6xl",
        }
    },
    collapse:{
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

  return (
    <Flowbite theme={{ theme: customHeaderTheme }}>
      <Navbar fluid rounded className="border-b">
        <Navbar.Brand href="/">
          <img alt="SiM Logo" className="mr-3 h-12 sm:h-14" src="/logo.png" />
          {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          SimplyManaged
        </span> */}
        </Navbar.Brand>
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
              <span className="block text-sm">{capitalizeString(globalState?.user?.name)}</span>
              <span className="block truncate text-sm font-medium">
                {globalState?.user?.email.toLowerCase()}
              </span>
            </Dropdown.Header>
            <Dropdown.Item className="font-normal" as={Link} to={`/${PATHS.MY_PROFILE}`}>My profile</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
          <Navbar.Link active={location.pathname === "/"} to="/" as={Link}>
            <p>Dashboard</p>
          </Navbar.Link>
          {/*SYSADMIN HEADER*/}
          {globalState?.user?.role == ROLES.SYSADMIN && (<Navbar.Link
            active={location.pathname.startsWith("/" + PATHS.EMPLOYEE)}
            to={`/${PATHS.EMPLOYEE}`}
            as={Link}
          >
            People
          </Navbar.Link>
          )}
          {/*SCHEDULER HEADER*/}
          {globalState?.user?.role == ROLES.SCHEDULER && (<Navbar.Link
            active={location.pathname.startsWith("/" + PATHS.SCHEDULE)}
            to={`/${PATHS.SCHEDULE}`}
            as={Link}
          >
            Schedule
          </Navbar.Link>
          )}
          {/* <Navbar.Link
            active={location.pathname.startsWith("/people")}
            to="/people"
            as={Link}
          >
            People
          </Navbar.Link> */}
          {globalState?.user?.role == ROLES.SCHEDULER && (<Navbar.Link
            active={location.pathname.startsWith("/" + PATHS.REQUESTS)}
            to={`/${PATHS.REQUESTS}`}
            as={Link}
          >
            Requests
          </Navbar.Link>
          )}
          {/* <Navbar.Link
            active={location.pathname.startsWith("/reports")}
            to="/reports"
            as={Link}
          >
            Reports
          </Navbar.Link> */}
          {/*EMPLOYEE*/}
          {globalState?.user?.role == ROLES.EMPLOYEE && (<Navbar.Link
            active={location.pathname.startsWith("/" + PATHS.SCHEDULE)}
            to={`/${PATHS.SCHEDULE}`}
            as={Link}
          >
            Schedule
          </Navbar.Link>
          )}
          {globalState?.user?.role == ROLES.EMPLOYEE && (<Navbar.Link
            active={location.pathname.startsWith("/" + PATHS.SCHEDULE)}
            to={`/${PATHS.REQUESTS}`}
            as={Link}
          >
            Requests
          </Navbar.Link>
          )}
        </Navbar.Collapse>
      </Navbar>
    </Flowbite>
  );
};

export default Header;

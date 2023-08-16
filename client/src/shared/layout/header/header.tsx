"use client";

import {
  Avatar,
  CustomFlowbiteTheme,
  Dropdown,
  Flowbite,
  Navbar,
} from "flowbite-react";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { GlobalStateContext } from "../../../configs/global-state-provider";

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
        on: "bg-blue-700 text-white dark:text-white md:bg-transparent md:text-blue-700",
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
        <Navbar.Brand href="https://flowbite-react.com">
          <img alt="SiM Logo" className="mr-3 h-6 sm:h-9" src="/favicon.svg" />
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
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
                className="mr-3"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{globalState?.user?.name}</span>
              <span className="block truncate text-sm font-medium">
                {globalState?.user?.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
          <Navbar.Link active={location.pathname === "/"} to="/" as={Link}>
            <p>Dashboard</p>
          </Navbar.Link>
          <Navbar.Link
            active={location.pathname.startsWith("/schedule")}
            to="/schedule"
            as={Link}
          >
            Schedule
          </Navbar.Link>
          <Navbar.Link
            active={location.pathname.startsWith("/people")}
            to="/people"
            as={Link}
          >
            People
          </Navbar.Link>
          <Navbar.Link
            active={location.pathname.startsWith("/requests")}
            to="/requests"
            as={Link}
          >
            Requests
          </Navbar.Link>
          <Navbar.Link
            active={location.pathname.startsWith("/reports")}
            to="/reports"
            as={Link}
          >
            Reports
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
    </Flowbite>
  );
};

export default Header;

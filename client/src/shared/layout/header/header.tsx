"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../../configs/global-state-provider";

const Header = () => {
  //   const [showMenu, setShowMenu] = React.useState(false);
  //   const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  return (
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
        <Navbar.Link active href="#">
          <p>Dashboard</p>
        </Navbar.Link>
        <Navbar.Link href="#">Schedule</Navbar.Link>
        <Navbar.Link href="#">Timesheet</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

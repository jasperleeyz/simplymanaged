import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { FooterDivider } from "flowbite-react/lib/esm/components/Footer/FooterDivider";
import { Avatar, Label, TextInput } from "flowbite-react";
import { capitalizeString } from "../../configs/utils";

const ProfilePage = () => {
  const globalState = React.useContext(GlobalStateContext).globalState;

  // TODO: get user profile (details, preferences) here
  //   globalState?.user.id

  return (
    <div id="profile-page">
      <p className="header">My Profile</p>
      <div id="profile-section" className="md:flex">
        <div className="w-full mb-6 md:m-auto md:w-2/5">
          <Avatar
            img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            size="xl"
            rounded
            alt="Profile image"
            className="m-auto"
          />
        </div>
        <div id="user-details" className="w-full md:w-3/5">
          <Label htmlFor="user-name" value="Name" />
          <p id="user-name">{capitalizeString(globalState?.user?.name)}</p>
          <Label htmlFor="user-email" value="Email" />
          <p id="user-email">{globalState?.user?.email.toLowerCase()}</p>
          <Label htmlFor="user-phone-no" value="Phone No." />
          <p id="user-phone-no">{globalState?.user?.phoneNo}</p>
          {/* <Label htmlFor="user-" value="Name" />
          <p id="user-name">{globalState?.user?.name}</p>
          <Label htmlFor="user-name" value="Name" />
          <p id="user-name">{globalState?.user?.name}</p> */}
        </div>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Employment Details</p>
      <div id="employment-section">
        <Label htmlFor="employment-id" value="Employee ID" />
        <p id="employment-id">{globalState?.user?.id}</p>
        <Label htmlFor="employment-type" value="Employment Type" />
        <p id="employment-type">{capitalizeString(globalState?.user?.employmentType)}</p>
        <Label htmlFor="employment-position" value="Position" />
        <p id="employment-position">{capitalizeString(globalState?.user?.position)}</p>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Preferences</p>
      <div id="preferences-section">
        <p>...</p>
      </div>
    </div>
  );
};

export default ProfilePage;

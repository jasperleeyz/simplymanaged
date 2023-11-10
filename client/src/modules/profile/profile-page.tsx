import React from "react";
import { GlobalStateContext, InitialGlobalState } from "../../configs/global-state-provider";
import { Avatar, Button, Label, TextInput } from "flowbite-react";
import { capitalizeString, validName, isNumber, validEmail } from "../../configs/utils"
import { HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";
import { toast } from 'react-toastify';
import { updateEmployee } from "../../shared/api/user.api";

const ProfilePage = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();

  const [editUser, setEditUser] = React.useState<IUser>(() => {
    return globalState?.user || ({} as IUser);
  });

  const [errorMessage, setErrorMessage] = React.useState(() => {
    return {
      name: "",
      email: "",
      contact_no: "",
    };
  });

  const [inputColor, setInputColor] = React.useState({
    name: 'gray',
    contact_no: 'gray',
    email: 'gray',
  })

  const isEdit = useLocation().pathname.endsWith("edit");

  // TODO: get user profile (details, preferences) here
  //   globalState?.user.id

  const updateProfile = () => {
  // Clear error messages
  setErrorMessage({
    name: '',
    contact_no: '',
    email: '',
  });
    // Validate user input
    if (
      !validName(editUser.fullname) ||
      !isNumber(editUser.contact_no) ||
      editUser.contact_no.length !== 8 ||
      !validEmail(editUser.email)
    ) {
      if (!validName(editUser.fullname)) {
        setErrorMessage((prev) => ({
          ...prev,
          name: 'Name must consist of letters only.',
        }));
        setInputColor((prev) => ({
          ...prev,
          name: 'failure',
        }));
      }
      if (!isNumber(editUser.contact_no) || editUser.contact_no.length !== 8) {
        setErrorMessage((prev) => ({
          ...prev,
          contact_no: 'Phone must contain only 8 numbers.',
        }));
        setInputColor((prev) => ({
          ...prev,
          contact_no: 'failure',
        }));
      }
      if (!validEmail(editUser.email)) {
        setErrorMessage((prev) => ({
          ...prev,
          email: 'Email must be in the format "emp@sim.com".',
        }));
        setInputColor((prev) => ({
          ...prev,
          email: 'failure',
        }));
      }
      toast.error('Invalid details');
      return; // Exit the function early if there are validation errors
    }
    // Make an API request to update the profile
    if (globalState && globalState.user && (editUser.fullname !== globalState.user.fullname || editUser.contact_no !== globalState.user.contact_no || editUser.email !== globalState.user.email)) {
      // Update the global state with the edited profile data
    try{
       updateEmployee(editUser).then(() => {
        toast.success('Profile updated');
        setGlobalState((prev) => ({
          ...prev,
          user: editUser,
        }))
      });
        // Navigate to the profile page
        navigate(`/${PATHS.MY_PROFILE}`, { replace: true });
    } catch (error) {
      toast.error('Failed to update the profile. Please try again later.');
    };
  };
};

  return (
    <div id="profile-page">
      <div className="flex justify-between">
        <p className="header">My Profile</p>
        {!isEdit ? (
          <Button
            size="sm"
            onClick={() =>
              navigate(`/${PATHS.MY_PROFILE}/${PATHS.EDIT_PROFILE}`)
            }
          >
            <HiPencil className="my-auto mr-2" />
            <p>Update Profile</p>
          </Button>
        ) : (
            <Button size="sm" onClick={() => updateProfile()}> 
            <HiSave className="my-auto mr-2" />
            <p>Save</p>
          </Button>
        )}
      </div>
      <div id="profile-section" className="md:flex">
        <div className="w-full mb-6 md:m-auto md:w-2/5">
          <Avatar
            img={globalState?.user?.profile_image}
            size="xl"
            rounded
            alt="Profile image"
            className="m-auto"
          />
        </div>
        <div id="user-details" className="w-full md:w-3/5">
          <Label htmlFor="user-name" value="Name" />
          {!isEdit ? (
            <p id="user-name">{capitalizeString(globalState?.user?.fullname)}</p>
          ) : (
            <TextInput
              id="user-name"
              value={capitalizeString(editUser?.fullname)}
              color={inputColor.name}
              required
              helperText={<span className="error-message">{errorMessage.name}</span>}
              onChange={(e) =>{
                setEditUser((prev) => ({ ...prev, fullname: e.target.value }))
                setInputColor(prev => ({ ...prev, fullname: 'gray'}))
              }}
              autoComplete="off"
            />
          )}
          <Label htmlFor="user-email" value="Email" />
          {!isEdit ? (
            <p id="user-email">{globalState?.user?.email.toLowerCase()}</p>
          ) : (
            <TextInput
              id="user-email"
              value={editUser?.email.toLowerCase()}
              color={inputColor.email}
              required
              helperText={<span className="error-message">{errorMessage.email}</span>}
              onChange={(e) =>{
                setEditUser((prev) => ({ ...prev, email: e.target.value }))
                setInputColor(prev => ({ ...prev, email: 'gray'}))
              }}
              autoComplete="off"
            />
          )}
          <Label htmlFor="user-phone-no" value="Phone" />
          {!isEdit ? (
            <p id="user-phone-no">{globalState?.user?.contact_no}</p>
          ) : (
            <TextInput
              id="user-phone-no"
              value={editUser?.contact_no}
              color={inputColor.contact_no}
              required
              helperText={<span className="error-message">{errorMessage.contact_no}</span>}
              onChange={(e) => {
                  setEditUser((prev) => ({ ...prev, contact_no: e.target.value }))
                  setInputColor(prev => ({ ...prev, contact_no: 'gray'}))
          
              }}
              autoComplete="off"
            />
          )}
        </div>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Employment Details</p>
      <div id="employment-section" className="px-12">
        <Label htmlFor="employment-id" value="Employee ID" />
        <p id="employment-id">{globalState?.user?.id}</p>
        <Label htmlFor="employment-type" value="Employment Type" />
        <p id="employment-type">
          {/* {capitalizeString(globalState?.user?.employmentType)} */}
        </p>
        <Label htmlFor="employment-position" value="Position" />
        <p id="employment-position">
          {capitalizeString(globalState?.user?.position)}
        </p>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Preferences</p>
      <div id="preferences-section" className="px-12">
        <p> 
          <label>
          </label>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;

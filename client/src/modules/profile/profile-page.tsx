import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Avatar, Button, Label, TextInput } from "flowbite-react";
import { capitalizeString, validName, isNumber, validEmail } from "../../configs/utils"
import { HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";
import { toast } from 'react-toastify';

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
      phoneNo: "",
    };
  });

  const [inputColor, setInputColor] = React.useState({
    name: 'gray',
    phoneNo: 'gray',
    email: 'gray',
  })

  const isEdit = useLocation().pathname.endsWith("edit");

  // TODO: get user profile (details, preferences) here
  //   globalState?.user.id

  const saveProfile = () => {

    setErrorMessage(prev => ({
      ...prev,
      name: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      phoneNo: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      email: '',
    }));

    if (!validName(editUser.name) || !isNumber(editUser.phoneNo) || (editUser.phoneNo.length != 8) || !validEmail(editUser.email)) {
      if (!validName(editUser.name)) {
        setErrorMessage(prev => ({
          ...prev,
          name: 'Name must consist of letters only.',
        }));
        setInputColor(prev => ({
          ...prev,
          name: 'failure',
        }));
      }
      if (!isNumber(editUser.phoneNo) || (editUser.phoneNo.length != 8)) {
        setErrorMessage(prev => ({
          ...prev,
          phoneNo: 'Phone must contain only 8 numbers.',
        }));
        setInputColor(prev => ({
          ...prev,
          phoneNo: 'failure',
        }));
      }
      if (!validEmail(editUser.email)) {
        setErrorMessage(prev => ({
          ...prev,
          email: 'Email must be in the format "emp@sim.com".',
        }));
        setInputColor(prev => ({
          ...prev,
          email: 'failure',
        }));
      }
      toast.error('Invalid details');
    }
    else{
      // save profile
      setGlobalState((prev) => ({
        ...prev,
        user: editUser,
      }));

      toast.success('Profile updated');

      // then navigate to profile page
      navigate(`/${PATHS.MY_PROFILE}`, { replace: true });
    }
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
          <Button size="sm" onClick={() => saveProfile()}>
            <HiSave className="my-auto mr-2" />
            <p>Save</p>
          </Button>
        )}
      </div>
      <div id="profile-section" className="md:flex">
        <div className="w-full mb-6 md:m-auto md:w-2/5">
          <Avatar
            img={globalState?.user?.profileImage}
            size="xl"
            rounded
            alt="Profile image"
            className="m-auto"
          />
        </div>
        <div id="user-details" className="w-full md:w-3/5">
          <Label htmlFor="user-name" value="Name" />
          {!isEdit ? (
            <p id="user-name">{capitalizeString(globalState?.user?.name)}</p>
          ) : (
            <TextInput
              id="user-name"
              value={capitalizeString(editUser?.name)}
              color={inputColor.name}
              required
              helperText={<span className="error-message">{errorMessage.name}</span>}
              onChange={(e) =>{
                setEditUser((prev) => ({ ...prev, name: e.target.value }))
                setInputColor(prev => ({ ...prev, name: 'gray'}))
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
            <p id="user-phone-no">{globalState?.user?.phoneNo}</p>
          ) : (
            <TextInput
              id="user-phone-no"
              value={editUser?.phoneNo}
              color={inputColor.phoneNo}
              required
              helperText={<span className="error-message">{errorMessage.phoneNo}</span>}
              onChange={(e) => {
                  setEditUser((prev) => ({ ...prev, phoneNo: e.target.value }))
                  setInputColor(prev => ({ ...prev, phoneNo: 'gray'}))
          
              }}
              autoComplete="off"
            />
          )}
          {/* <Label htmlFor="user-" value="Name" />
          <p id="user-name">{globalState?.user?.name}</p>
          <Label htmlFor="user-name" value="Name" />
          <p id="user-name">{globalState?.user?.name}</p> */}
        </div>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Employment Details</p>
      <div id="employment-section" className="px-12">
        <Label htmlFor="employment-id" value="Employee ID" />
        <p id="employment-id">{globalState?.user?.id}</p>
        <Label htmlFor="employment-type" value="Employment Type" />
        <p id="employment-type">
          {capitalizeString(globalState?.user?.employmentType)}
        </p>
        <Label htmlFor="employment-position" value="Position" />
        <p id="employment-position">
          {capitalizeString(globalState?.user?.position)}
        </p>
      </div>
      <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <p className="header">Preferences</p>
      <div id="preferences-section" className="px-12">
        <p>...</p>
      </div>
    </div>
  );
};

export default ProfilePage;

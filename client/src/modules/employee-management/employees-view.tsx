import React, { useState, useEffect } from 'react'
import { Avatar,  Label } from "flowbite-react"
import IUser from "../../shared/model/user.model"
import { ROLES } from "../../configs/constants"
import BackButton from "../../shared/layout/buttons/back-button";

const EmployeesViewPage = () => {

  const [auth, setAuth] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<IUser>({
    id: 0,
    company_id: 0,
    fullname: '',
    email: '',
    contact_no: '',
    role: ROLES.EMPLOYEE,
    position: '',
    // employmentType: {},
    status: ''
  });

  useEffect(() => {
    const tempData = (localStorage.getItem('viewEmployee') || '')
    if (tempData != '') {
      const data = JSON.parse(tempData)
      const tempEmployee: IUser = {
        id: data.id,
        company_id: data.company_id,
        fullname: data.fullname,
        email: data.email,
        contact_no: data.contact_no,
        role: data.role,
        position: data.position,
        // employmentType: data.employmentType,
        profile_image: data.profile_image,
        status: data.status,
      };
      setViewEmployee(tempEmployee);
      localStorage.removeItem('viewEmployee');
      setAuth(true);
    }
  }, []);

  return (
    <div>
      {auth ? (
        <div id="profile-page">
          <div className="flex justify-between">
            <p className="header">Profile</p>
            <BackButton />
          </div>
          <div id="profile-section" className="md:flex">
            <div className="w-full mb-6 md:m-auto md:w-2/5">
              <Avatar
                img={viewEmployee.profile_image}
                size="xl"
                rounded
                alt="Profile image"
                className="m-auto"
              />
            </div>
            <div id="user-details" className="w-full md:w-3/5">
              <Label htmlFor="user-name" value="Name" />
              <p id="user-name">{viewEmployee.fullname}</p>
              <Label htmlFor="user-email" value="Email" />
              <p id="user-email">{viewEmployee.email}</p>
              <Label htmlFor="user-phone-no" value="Phone No." />
              <p id="user-phone-no">{viewEmployee.contact_no}</p>
            </div>
          </div>
          <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <p className="header">Employment Details</p>
          <div id="employment-section" className="px-12">
            <Label htmlFor="employment-id" value="Employee ID" />
            <p id="employment-id">{viewEmployee.id}</p>
            <Label htmlFor="employment-type" value="Employment Type" />
            <p id="employment-type">
              {/* {viewEmployee.employmentType} */}
            </p>
            <Label htmlFor="employment-position" value="Position" />
            <p id="employment-position">
              {viewEmployee.position}
            </p>
            <Label htmlFor="employment-position" value="Account Status" />
            <p id="employment-position">
              {viewEmployee.status}
            </p>
          </div>
          <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <p className="header">Preferences</p>
          <div id="preferences-section" className="px-12">
            <p>...</p>
          </div>
        </div>
      ) : (<div className='text-center'>
        <h1 >400 </h1>
        <div>BAD REQUEST</div>
      </div>)
      }
    </div>
  );

};

export default EmployeesViewPage

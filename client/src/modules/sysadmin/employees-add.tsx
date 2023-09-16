import React, { useState, useEffect } from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import {
  Avatar,
  Checkbox,
  Button,
  Label,
  TextInput,
  Table,
  Pagination,
  Toast,
  Select,
} from "flowbite-react";
import { capitalizeString, isNumber } from "../../configs/utils";
import { HiCheck, HiX, HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";
import { ROLES } from "../../configs/constants";

const EmployeesAddPage = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();

  // TODO: to retrieve employees from API // should return only employees that are
  const [employees, setEmployees] = useState<IUser[]>(
    globalState?.employee || []
  );

  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: ""
  });

  const resetEmployee = () => {
    setEmployee({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      role: ''
    });
  };

  const [errorMessage, setErrorMessage] = useState({
    firstName : "",
    lastName : "",
    phone: "",
    email: "",
  });

  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    // Perform the action associated with the button here
    // Set the selected button
    setSelectedButton(buttonName);

    let role = ""; // Initialize role variable

    if (buttonName === ROLES.EMPLOYEE) {
      role = ROLES.EMPLOYEE; // Assuming 'R' is for Employee
    } else if (buttonName === ROLES.SCHEDULER) {
      role = ROLES.SCHEDULER;
    } else if (buttonName === ROLES.SYSADMIN) {
      role = ROLES.SYSADMIN;
    }
    employee.role = role;
  };

  const getButtonStyle = (buttonName) => {
    return {
      backgroundColor: selectedButton === buttonName ? "gray" : "white",
      color: selectedButton === buttonName ? "white" : "black",
    };
  };

  const addEmployeeFunc = () => {
    const newEmployee: IUser = {
      id: employees.length + 1,
      name: employee.firstName + " " + employee.lastName,
      email: employee.email,
      phoneNo: employee.phone,
      role: employee.role,
      position: "Position",
      employmentType: "Full Time",
    };

    const updatedEmployees = [...employees];

    updatedEmployees.push(newEmployee);

    setEmployees(updatedEmployees);

    setGlobalState(prev => ({
      ...prev,
      employee: updatedEmployees,
    }));

    setPageToast(prev => ({
      ...prev,
      added: true
    }))
    
    setSelectedButton(null)
    getButtonStyle(ROLES.EMPLOYEE)
    getButtonStyle(ROLES.SCHEDULER)
    getButtonStyle(ROLES.SYSADMIN)

    resetEmployee()

  };

    //Toast
    const [pageToast, setPageToast] = useState({
      added : false,
      failed : false
    })

  return (
    <div id="add-employee-page">
      <p className="header">Add an employee</p>
      <div id="user-details" className="w-full md:w-3/5">
        <div className="flex">
          <div className="flex-1 pr-2">
            <Label htmlFor="first-name" value="First Name*" />
            <TextInput
              id="first-name"
              placeholder="Given Name"
              sizing="md"
              required
              value={employee.firstName}
              style={{ width: "100%" }}
              onChange= {(e) => {setEmployee(prev => ({
                ...prev,
                firstName: capitalizeString(e.target.value)
              }))}}
              autoComplete="off"
            />
          </div>
          <div className="flex-1 pl-2">
            <Label htmlFor="last-name" value="Last Name*" />
            <TextInput
              id="last-name"
              placeholder="Family Name"
              sizing="md"
              required
              value={employee.lastName}
              style={{ width: "100%" }}
              onChange= {(e) => {setEmployee(prev => ({
                ...prev,
                lastName: capitalizeString(e.target.value)
              }))}}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="mt-4">
          {" "}
          {/* Add margin-top for spacing */}
          <Label htmlFor="contact-information" value="Contact Information" />
          <div className="flex">
            <div className="flex-1 pr-2">
              <TextInput
                id="phone"
                placeholder="Phone"
                sizing="md"
                required
                value={employee.phone}
                style={{ width: "100%" }}
                helperText={<span className="error-message">{errorMessage.phone}</span>}
                onChange= {(e) => {setEmployee(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}}
                autoComplete="off"
              />
            </div>
            <div className="flex-1 pl-2">
              <TextInput
                id="email"
                placeholder="Email"
                sizing="md"
                required
                value={employee.email}
                style={{ width: "100%" }}
                onChange= {(e) => {setEmployee(prev => ({
                  ...prev,
                  email: e.target.value.toLowerCase()
                }))}}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          {" "}
          {/* Add margin-top for spacing */}
          <div className="flex items-center gap-2">
            <Checkbox id="auth-link" />
            <Label
              htmlFor="auth-link"
              value="Send authentication link to email"
            />
          </div>
        </div>
        <div className="mt-2">
          {" "}
          {/* Add margin-top for spacing */}
          <Label htmlFor="access-level" value="Access Level" />
        </div>
        <div className="mt-2">
          {" "}
          {/* Add margin-top for spacing */}
          <Button.Group>
            <Button
              color="gray"
              onClick={() => handleButtonClick(ROLES.EMPLOYEE)}
              style={getButtonStyle(ROLES.EMPLOYEE)}
            >
              Employee
            </Button>
            <Button
              color="gray"
              onClick={() => handleButtonClick(ROLES.SCHEDULER)}
              style={getButtonStyle(ROLES.SCHEDULER)}
            >
              Manager
            </Button>
            <Button
              color="gray"
              onClick={() => handleButtonClick(ROLES.SYSADMIN)}
              style={getButtonStyle(ROLES.SYSADMIN)}
            >
              System Admin
            </Button>
          </Button.Group>
        </div>

        {/*
          <div className="mt-4"> {//Add margin-top for spacing }
            <Label htmlFor="role" value="Role" />
          </div>
          <div className="mt-2"> {//Add margin-top for spacing }
            <TextInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '30%' }}
                autoComplete="off"
            />
          </div>
          }*/}
        <div className="mt-4 flex">
          {/* Add margin-top for spacing */}
          <div className="pr-2">
            <Button
              color="gray"
              onClick={() => {
                navigate(`/${PATHS.EMPLOYEES}`);
                addEmployeeFunc();
              }}
              disabled={!employee.firstName || !employee.lastName || !employee.email || !employee.phone || !selectedButton}
            >
              Save and finish
            </Button>
          </div>
          <div className="pl-2">
            <Button color="gray" 
              onClick={() => addEmployeeFunc()}
              disabled={!employee.firstName || !employee.lastName || !employee.email || !employee.phone || !selectedButton}>
              Save and add new
            </Button>
            
          </div>
        </div>
      </div>

      <div>
        {pageToast.added && (
          <Toast
            style={{
              position: "absolute",
              top: "100px",
              right: "10px",
              width: "17%",
            }}
          >
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
            <Label
              className="ml-3 text-sm font-normal"
              value="Added employee successfully."
            />
            <Toast.Toggle
              onDismiss={() => setPageToast(prev => ({
                ...prev,
                added: false
              }))}
            />
          </Toast>
        )}
        {/*
      <Toast style={{ position: 'absolute', top: '100px', right: '10px' }}>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
          <HiX className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">
          Added employee successfully.
        </div>
        <Toast.Toggle />
      </Toast>
          */}
      </div>
    </div>
  );
};

export default EmployeesAddPage;

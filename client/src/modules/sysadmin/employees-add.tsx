import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStateContext } from "../../configs/global-state-provider";
import {
  Avatar,
  Checkbox,
  Button,
  Label,
  TextInput,
  Table,
  Pagination,
  Select,
} from "flowbite-react";
import { capitalizeString, isNumber, validName, validEmail  } from "../../configs/utils";
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

  const [inputColor, setInputColor] = useState({
    firstName : 'gray',
    lastName : 'gray',
    phone: 'gray',
    email: 'gray',
  })

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

  const addEmployeeFunc = (addNew) => {

    //Check Name Error
    if(!validName(employee.firstName) || !validName(employee.lastName) || !isNumber(employee.phone) || !validEmail(employee.email)){
      
      if (!validName(employee.firstName)){
        setInputColor(prev => ({
          ...prev,
          firstName: 'failure',
        }));
      }
      if(!validName(employee.lastName)){
        setInputColor(prev => ({
          ...prev,
          lastName: 'failure',
        }));
      }
      if(!isNumber(employee.phone)){
        setInputColor(prev => ({
          ...prev,
          phone: 'failure',
        }));
      }
      if(!validEmail(employee.email)){
        console.log(' .... Is valid email:', employee.email);
        setInputColor(prev => ({
          ...prev,
          email: 'failure',
        }));
      }

      toast.error('Invalid Details.',{
        position : "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        progress: undefined,
        theme: "light",
        });
        return;
    }

    const newEmployee: IUser = {
      id: employees.length + 1,
      name: employee.firstName + " " + employee.lastName,
      email: employee.email,
      phoneNo: employee.phone,
      role: employee.role,
      position: "Position",
      employmentType: "Full Time",
    };
    
    console.log('Is valid email:', employee.email);

    const updatedEmployees = [...employees];

    updatedEmployees.push(newEmployee);

    setEmployees(updatedEmployees);

    setGlobalState(prev => ({
      ...prev,
      employee: updatedEmployees,
    }));
    
    setSelectedButton(null)
    getButtonStyle(ROLES.EMPLOYEE)
    getButtonStyle(ROLES.SCHEDULER)
    getButtonStyle(ROLES.SYSADMIN)

    resetEmployee()

    toast.success('Added Employee Sucessfully.',{
      position : "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      progress: undefined,
      theme: "light",
      });
      return;

    

  };

  return (
    <div id="add-employee-page" className="relative">
      <p className="header">Add an employee</p>
      <div id="user-details" className="w-full md:w-3/5">
        <div className="flex">
          <div className="flex-1 pr-2">
            <Label htmlFor="first-name" value="First Name*" />
            <TextInput
              id="first-name"
              color = {inputColor.firstName}
              placeholder="Given Name"
              sizing="md"
              required
              value={employee.firstName}
              style={{ width: "100%" }}
              onChange= {(e) => {setEmployee(prev => ({
                ...prev,
                firstName: capitalizeString(e.target.value)
              }))
              setInputColor(prev => ({
                ...prev,
                firstName: 'gray',
              }))  
              }}
              autoComplete="off"
            />
          </div>
          <div className="flex-1 pl-2">
            <Label htmlFor="last-name" value="Last Name*" />
            <TextInput
              id="last-name"
              color = {inputColor.lastName}
              placeholder="Family Name"
              sizing="md"
              required
              value={employee.lastName}
              style={{ width: "100%" }}
              onChange= {(e) => {setEmployee(prev => ({
                ...prev,
                lastName: capitalizeString(e.target.value)
              }))
              setInputColor(prev => ({
                ...prev,
                lastName: 'gray',
              }))
              }}
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
                color = {inputColor.phone}
                placeholder="Phone"
                sizing="md"
                required
                value={employee.phone}
                style={{ width: "100%" }}
                helperText={<span className="error-message">{errorMessage.phone}</span>}
                onChange= {(e) => {setEmployee(prev => ({
                  ...prev,
                  phone: e.target.value
                }))
                setInputColor(prev => ({
                  ...prev,
                  phone: 'gray',
                }))
                }}
                autoComplete="off"
              />
            </div>
            <div className="flex-1 pl-2">
              <TextInput
                id="email"
                color = {inputColor.email}
                placeholder="Email"
                sizing="md"
                required
                value={employee.email}
                style={{ width: "100%" }}
                onChange= {(e) => {setEmployee(prev => ({
                  ...prev,
                  email: e.target.value.toLowerCase()
                }))
                setInputColor(prev => ({
                  ...prev,
                  email: 'gray',
                }))  
                }}
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
                addEmployeeFunc(false);
              }}
              disabled={!employee.firstName || !employee.lastName || !employee.email || !employee.phone || !selectedButton}
            >
              Save and finish
            </Button>
          </div>
          <div className="pl-2">
            <Button color="gray" 
              onClick={() => addEmployeeFunc(true)}
              disabled={!employee.firstName || !employee.lastName || !employee.email || !employee.phone || !selectedButton}>
              Save and add new
            </Button>
            
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EmployeesAddPage;

import React, { useState, useEffect } from 'react';
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Avatar, Checkbox, Button, Label, TextInput, Table, Pagination, Toast, Select} from "flowbite-react";
import { capitalizeString, isNumber } from "../../configs/utils";
import { HiCheck, HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";

const EmployeesPage = () => {

  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();

  //People Page Variable
  // TODO: to retrieve employees from API // should return only employees that are
  // available or meet the schedule criteria
  const [employees, setEmployees] = useState<IUser[]>(globalState?.employee || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);

  useEffect(() => {
    // When the searchTerm changes, update the filteredEmployees state.
    const filtered = employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const [currentPage, setCurrentPage] = useState(1);
  const onPageChange = (page: number) => setCurrentPage(page);

  // Calculate the indices for the employees to display based on currentPage and employeesPerPage
  const employeesPerPage = 10;
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const employeesToDisplay = filteredEmployees.slice(startIndex, endIndex);

  const addEmployeePage = useLocation().pathname.endsWith("add");
  const editEmployeePage = useLocation().pathname.endsWith("edit");










  //Add Employee Page Variable

  const [firstName, setFirstName] = useState('');

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const [lastName, setLastName] = useState('');

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const [phone, setPhone] = useState('');

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const [email, setEmail] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    // Perform the action associated with the button here
    console.log(`Button "${buttonName}" was clicked.`);
    // Set the selected button
    setSelectedButton(buttonName);
  };

  const getButtonStyle = (buttonName) => {
    return {
      backgroundColor: selectedButton === buttonName ? 'gray' : 'white',
      color: selectedButton === buttonName ? 'white' : 'black',
      // Add other styles as needed
    };
  };

  const addEmployeeFunc = () => {

    const newEmployee: IUser = {
      id: employees.length+1,
      name: firstName + ' ' + lastName,
      email: email,
      phoneNo: phone,
      role: 'Employee',
      position: 'Position',
      employmentType: 'Full Time',
    };
    
    const updatedEmployees = [...employees];

    updatedEmployees.push(newEmployee);

    setEmployees(updatedEmployees);

    setGlobalState((prev) => ({
      ...prev,
      employee: updatedEmployees,
    }));
  }

  const handleSaveAndReload = () => {

    addEmployeeFunc()

    console.log(employees.length)

    // Reload the page
    setFirstName('')
    setLastName('')
    setPhone('')
    setEmail('')

    
  };



  //Edit Employee Page Variable

  const [editEmployee, setEditEmployee] = useState<IUser>();

  const [errorMessage, setErrorMessage] = React.useState(() => {
    return {
      name: "",
      email: "",
      phoneNo: "",
    };
  });


  // TODO: get user profile (details, preferences) here
  //   globalState?.user.id

  const saveProfile = () => {
    // save profile
    setGlobalState((prev) => ({
      ...prev,
      user: editEmployee,
    }));

    // then navigate to profile page
    navigate(`/${PATHS.MY_PROFILE}`, { replace: true });
  };

  return (
    <div>
      {addEmployeePage ? (
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
                value = {firstName}
                style={{ width: '100%' }}
                onChange={handleFirstNameChange}
              />
            </div>
            <div className="flex-1 pl-2">
              <Label htmlFor="last-name" value="Last Name*" />
              <TextInput
                id="last-name"
                placeholder= 'Family Name'
                sizing="md"
                required
                value = {lastName}
                style={{ width: '100%' }}
                onChange={handleLastNameChange}
              />
            </div>
          </div>
          <div className="mt-4"> {/* Add margin-top for spacing */}
            <Label htmlFor="contact-information" value="Contact Information" />
            <div className="flex">
              <div className="flex-1 pr-2">
                <TextInput
                  id="phone"
                  placeholder="Phone"
                  sizing="md"
                  required
                  value = {phone}
                  style={{ width: '100%' }}
                  onChange={handlePhoneChange}
                />
              </div>
              <div className="flex-1 pl-2">
                <TextInput
                id="email"
                placeholder="Email"
                sizing="md"
                required
                value = {email}
                style={{ width: '100%' }}
                onChange={handleEmailChange}
              />
              </div>
            </div>
          </div>
          <div className="mt-4"> {/* Add margin-top for spacing */}
            <div className="flex items-center gap-2">
              <Checkbox id="auth-link" />
              <Label htmlFor="auth-link" value = "Send authentication link to email" />
            </div>
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="access-level" value="Access Level" />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Button.Group>
              <Button color="gray" 
                onClick={() => handleButtonClick('Employee')}
                style={getButtonStyle('Employee')}>
                Employee
              </Button>
              <Button color="gray"
                onClick={() => handleButtonClick('Manager')}
                style={getButtonStyle('Manager')}>
                Manager
              </Button>
              <Button color="gray"
                onClick={() => handleButtonClick('System Admin')}
                style={getButtonStyle('System Admin')}>
                System Admin
              </Button>
            </Button.Group>
            </div>
          <div className="mt-4"> {/* Add margin-top for spacing */}
            <Label htmlFor="role" value="Role" />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <TextInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '30%' }}
            />
          </div>
          <div className="mt-4 flex" > {/* Add margin-top for spacing */}
            <div className="pr-2">
              <Button color="gray"
                onClick={() => navigate(`/${PATHS.EMPLOYEES}`)}>
                Save and finish
              </Button>
            </div>
            <div className="pl-2">
              <Button color="gray"
                onClick={() => handleSaveAndReload()}>
                Save and add new
              </Button>
            </div>
          </div>
        </div>
      </div>
      ) : editEmployeePage ?(
        <div id="edit-employee-page">
        <p className="header">Profile</p>
        <div id="user-details" className="w-full md:w-3/5">
              <Label htmlFor="name" value="Name" />
              <TextInput
                id="first-name"
                placeholder= {editEmployee?.name}
                sizing="md"
                required
                value = {firstName}
                style={{ width: '50%' }}
                onChange={handleFirstNameChange}
              />
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="email" value="Email" />
                <TextInput
                id="email"
                placeholder= {editEmployee?.email}
                sizing="md"
                required
                value = {email}
                style={{ width: '50%' }}
                onChange={handleEmailChange}
              />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="phone" value="Contact" />
                <TextInput
                id="phone"
                placeholder={editEmployee?.phoneNo}
                sizing="md"
                required
                value = {email}
                style={{ width: '50%' }}
                onChange={handleEmailChange}
              />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="role" value="Role" />
            <Select
              id="role"
              required
              style={{ width: '50%' }}
            >
              <option>
                Employee
              </option>
              <option>
                Manager
              </option>
              <option>
                System Admin
              </option>
            </Select>
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="location" value="Location" />
                <TextInput
                id="phone"
                placeholder="Phone"
                sizing="md"
                required
                value = {email}
                style={{ width: '50%' }}
                onChange={handleEmailChange}
              />
          </div>
          <div className="mt-4 flex" > {/* Add margin-top for spacing */}
            <div className="pr-2">
              <Button color="gray"
                onClick={() => navigate(`/${PATHS.EMPLOYEES}`)}>
                Apply
              </Button>
            </div>
            <div className="pr-2 pl-2">
              <Button color="gray"
                onClick={() => handleSaveAndReload()}>
                Save
              </Button>
            </div>
            <div className="pl-2">
              <Button color="gray"
                onClick={() => handleSaveAndReload()}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
      ) : (
      <div id="main-page">
        <div className="flex justify-between">
          <TextInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() =>
              navigate(`/${PATHS.EMPLOYEES}/${PATHS.ADD_EMPLOYEE}`)
            }
          >
            <HiPencil className="my-auto mr-2" />
            <p>Add Employee</p>
          </Button>
        </div>
        <div id="people-section" className="mt-4">
          <Table>
            <Table.Head>
              <Table.HeadCell>Employee</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Location</Table.HeadCell>
              <Table.HeadCell>Account Status</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">
                  <HiPencil className="my-auto mr-2" />
                  Edit
                </span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {employeesToDisplay.map((emp, idx) => (
                <Table.Row key={idx} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {emp.name}
                  </Table.Cell>
                  <Table.Cell>{emp.email}</Table.Cell>
                  <Table.Cell>{emp.phoneNo}</Table.Cell>
                  <Table.Cell>{emp.position}</Table.Cell>
                  <Table.Cell>{emp.employmentType}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      onClick={() =>{
                        navigate(`/${PATHS.EMPLOYEES}/${PATHS.EDIT_PROFILE}`)
                        setEditEmployee(emp)
                        }
                      }
                    >
                      <HiPencil/>
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        <div className="text-center mt-4">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} Entries
        </div>
        <div className="flex items-center justify-center text-center">
          <Pagination
            currentPage={currentPage}
            layout="pagination"
            onPageChange={page=>{setCurrentPage(page)}}
            showIcons
            totalPages={Math.ceil(filteredEmployees.length/employeesPerPage)}
          />
        </div>
      </div>
      )}
    </div>
  );
};

export default EmployeesPage;

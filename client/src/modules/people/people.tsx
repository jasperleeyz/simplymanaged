import React, { useState, useEffect } from 'react';
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Avatar, Checkbox, Button, Label, TextInput, Table, Pagination} from "flowbite-react";
import { capitalizeString, isNumber } from "../../configs/utils";
import { HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";

const PeoplePage = () => {

  //Add Employee Page Variable
  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    // Perform the action associated with the button here
    console.log(`Button "${buttonName}" was clicked.`);
    // Set the selected button
    setSelectedButton(buttonName);
  };

  const getButtonStyle = (buttonName) => {
    return {
      backgroundColor: selectedButton === buttonName ? '#333' : 'gray',
      color: selectedButton === buttonName ? 'white' : 'black',
      // Add other styles as needed
    };
  };







  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();

  const [editUser, setEditUser] = useState<IUser>();

  const [errorMessage, setErrorMessage] = React.useState(() => {
    return {
      name: "",
      email: "",
      phoneNo: "",
    };
  });

  const addEmployee = useLocation().pathname.endsWith("add");
  const editEmployee = useLocation().pathname.endsWith("edit");

  // TODO: get user profile (details, preferences) here
  //   globalState?.user.id

  const saveProfile = () => {
    // save profile
    setGlobalState((prev) => ({
      ...prev,
      user: editUser,
    }));

    // then navigate to profile page
    navigate(`/${PATHS.MY_PROFILE}`, { replace: true });
  };

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
  }, [searchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const onPageChange = (page: number) => setCurrentPage(page);

  // Calculate the indices for the employees to display based on currentPage and employeesPerPage
  const employeesPerPage = 10;
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const employeesToDisplay = filteredEmployees.slice(startIndex, endIndex);

  return (
    <div>
      {addEmployee ? (
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
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex-1 pl-2">
              <Label htmlFor="last-name" value="Last Name*" />
              <TextInput
                id="last-name"
                placeholder="Family Name"
                sizing="md"
                required
                style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
                />
              </div>
              <div className="flex-1 pl-2">
                <TextInput
                id="email"
                placeholder="Email"
                sizing="md"
                style={{ width: '100%' }}
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
          <div className="mt-4"> {/* Add margin-top for spacing */}
            <Label htmlFor="access-level" value="Access Level" />
          </div>
          <div className="mt-4"> {/* Add margin-top for spacing */}
            <>
            <button
        onClick={() => handleButtonClick('Employee')}
        style={getButtonStyle('Employee')}
      >
        Employee
      </button>
      <button
        onClick={() => handleButtonClick('Manager')}
        style={getButtonStyle('Manager')}
      >
        Manager
      </button>
      <button
        onClick={() => handleButtonClick('System Admin')}
        style={getButtonStyle('System Admin')}
      >
        System Admin
      </button>
              </>
            </div>
        </div>
      </div>
      ) : editEmployee ?(
      <div id="edit-employee-page">
        <div className="flex justify-between">
          Edit an employee
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
          <hr />
          <Button
            size="sm"
            onClick={() =>
              navigate(`/${PATHS.EMPLOYEE}/${PATHS.ADD_EMPLOYEE}`)
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
                        navigate(`/${PATHS.EMPLOYEE}/${PATHS.EDIT_PROFILE}`)
                        setEditUser(emp)
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

export default PeoplePage;

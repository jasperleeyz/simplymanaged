import { useContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Button, TextInput, Table, Pagination } from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";

const EmployeesPage = () => {
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();

  useEffect(() => {
    const addEmployee = localStorage.getItem('addEmployee');
    if (addEmployee === 'true') {
      toast.success('Added employee sucessfully');
      localStorage.removeItem('addEmployee');
    }
  }, []);
  //Main Page Variable
  // TODO: to retrieve employees from API // should return only employees that are
  const [employees] = useState<IUser[]>(
    globalState?.employees || []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);

  useEffect(() => {
    // When the searchTerm changes, update the filteredEmployees state.
    const filtered = employees.filter((emp) =>
      emp.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the indices for the employees to display based on currentPage and employeesPerPage
  const employeesPerPage = 10;
  const startIndex = (currentPage - 1) * employeesPerPage;
  const endIndex = startIndex + employeesPerPage;
  const employeesToDisplay = filteredEmployees.slice(startIndex, endIndex);

  return (
    <div id="main-page">
      <p className="header">Employees</p>
      <div className="flex justify-between">
        <TextInput
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        <Button
          size="sm"
          onClick={() => navigate(`/${PATHS.EMPLOYEES}/${PATHS.ADD_EMPLOYEE}`)}
        >
          <HiPencil className="my-auto mr-2" />
          <p>Add Employee</p>
        </Button>
      </div>
      <div id="people-section" className="mt-4">
        <Table>
          <Table.Head>
            <Table.HeadCell><label>Employee</label></Table.HeadCell>
            <Table.HeadCell><label>Email</label></Table.HeadCell>
            <Table.HeadCell><label>Phone</label></Table.HeadCell>
            <Table.HeadCell><label>Position</label></Table.HeadCell>
            <Table.HeadCell><label>Account Status</label></Table.HeadCell>
            <Table.HeadCell>
            </Table.HeadCell>
            <Table.HeadCell>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {employeesToDisplay.map((emp, idx) => (
              <Table.Row
                key={idx}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {emp.fullname}
                </Table.Cell>
                <Table.Cell><label>{emp.email}</label></Table.Cell>
                <Table.Cell><label>{emp.contactNo}</label></Table.Cell>
                <Table.Cell><label>{emp.position}</label></Table.Cell>
                <Table.Cell><label>{emp.status}</label></Table.Cell>
                <Table.Cell>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate(`/${PATHS.EMPLOYEES}/${PATHS.EDIT_PROFILE}`);
                      localStorage.setItem('editEmployee', JSON.stringify(emp));
                    }}
                  >
                    Edit
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate(`/${PATHS.EMPLOYEES}/${PATHS.VIEW_EMPLOYEE}`);
                      localStorage.setItem('viewEmployee', JSON.stringify(emp));
                    }}
                  >
                    View
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className="text-center mt-4">
        <label>
          {filteredEmployees.length === 0
            ? `Showing ${startIndex}  to ${Math.min(
              endIndex,
              filteredEmployees.length
            )} of ${filteredEmployees.length} Entries`
            : `Showing ${startIndex + 1}  to ${Math.min(
              endIndex,
              filteredEmployees.length
            )} of ${filteredEmployees.length} Entries`}
        </label>
      </div>
      <div className="flex items-center justify-center text-center">
        <Pagination
          currentPage={currentPage}
          layout="pagination"
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={Math.ceil(filteredEmployees.length / employeesPerPage)}
        />
      </div>
    </div>
  );
};

export default EmployeesPage;

import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GlobalStateContext } from "../../configs/global-state-provider";
import {
  Button,
  TextInput,
  Table,
  Pagination,
  Spinner,
  CustomFlowbiteTheme,
} from "flowbite-react";
import { HiUserAdd } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS, USER_STATUS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";
import { getAllEmployees } from "../../shared/api/user.api";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const EmployeesPage = () => {
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(location?.state?.page || 1);
  const [sizePerPage, setSizePerPage] = useState(
    location?.state?.sizePerPage || 10
  );
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [employeeList, setEmployeeList] = useState<IUser[]>([]);
  // const [codeList, setCodeList] = useState<IApplicationCode[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);

  useEffect(() => {
    Promise.all([
      // get employees based on company id of current system admin logged in
      getAllEmployees(
        globalState?.user?.company_id || 0,
        currentPage,
        sizePerPage
      ).then((res) => {
        setEmployeeList(res.data);
        setTotalPages(res.totalPages);
      }),
    ]).finally(() => {
      setLoading((prev) => false);
    });
  }, []);

  useEffect(() => {
    // When the searchTerm changes, update the filteredEmployees state.
    // const filtered = employeeList.filter((emp) =>
    //   emp.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    // setFilteredEmployees(filtered);
    // setCurrentPage(1);
    // if (searchTerm !== "") {
      setLoading((prev) => true);
      getAllEmployees(
        globalState?.user?.company_id || 0,
        1,
        sizePerPage,
        undefined,
        searchTerm ? `contains(fullname,${searchTerm})` : undefined
      )
        .then((res) => {
          setEmployeeList(res.data);
          setTotalPages(res.totalPages);
          setCurrentPage((prev) => 1);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    // }
  }, [searchTerm]);

  useEffect(() => {
    if (
      currentPage !== location?.state?.page ||
      sizePerPage !== location?.state?.sizePerPage
    ) {
      location.state = {
        ...location.state,
        page: currentPage,
        sizePerPage: sizePerPage,
      };
    }
  }, [currentPage, sizePerPage]);

  const generateBody = () => {
    if (employeeList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={6} className="text-center">
            No employees found
          </Table.Cell>
        </Table.Row>
      );
    }

    return employeeList.map((emp, idx) => (
      <Table.Row
        key={idx}
        className="bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {emp.fullname}
        </Table.Cell>
        <Table.Cell>
          <label>{emp.email}</label>
        </Table.Cell>
        <Table.Cell>
          <label>{emp.contact_no}</label>
        </Table.Cell>
        <Table.Cell>
          <label>{emp.position}</label>
        </Table.Cell>
        <Table.Cell>
          <label>{USER_STATUS[emp?.status || ""] || emp?.status}</label>
        </Table.Cell>
        <Table.Cell className="flex gap-2 justify-center">
          <Button
            size="sm"
            onClick={() => {
              navigate(`/${PATHS.EMPLOYEES}/${PATHS.EDIT_EMPLOYEE}/${emp.id}`);
              localStorage.setItem("editEmployee", JSON.stringify(emp));
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => {
              navigate(`/${PATHS.EMPLOYEES}/${PATHS.VIEW_EMPLOYEE}/${emp.id}`);
              localStorage.setItem("viewEmployee", JSON.stringify(emp));
            }}
          >
            View
          </Button>
        </Table.Cell>
      </Table.Row>
    ));
  };

  // Calculate the indices for the employees to display based on currentPage and employeesPerPage
  // const employeesPerPage = 10;
  // const startIndex = (currentPage - 1) * employeesPerPage;
  // const endIndex = startIndex + employeesPerPage;
  // const employeesToDisplay = filteredEmployees.slice(startIndex, endIndex);

  return (
    <div id="employees-main">
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
          <HiUserAdd className="my-auto mr-2" />
          <p>Add Employee</p>
        </Button>
      </div>
      <div id="people-section" className="mt-4 overflow-x-auto">
        <Table theme={customTableTheme}>
          <Table.Head>
            <Table.HeadCell>Employee</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Phone</Table.HeadCell>
            <Table.HeadCell>Position</Table.HeadCell>
            <Table.HeadCell>Account Status</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center">
                  <Spinner size="xl" />
                </Table.Cell>
              </Table.Row>
            ) : (
              generateBody()
            )}
          </Table.Body>
        </Table>
      </div>
      {/* <div className="text-center mt-4">
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
      </div> */}
      <div className="flex mt-4 items-center justify-center text-center">
        <Pagination
          currentPage={currentPage}
          // layout="pagination"
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default EmployeesPage;

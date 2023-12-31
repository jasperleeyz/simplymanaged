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
import { getAllEmployees, updateEmployee } from "../../shared/api/user.api";
import DeactivateButton from "../../shared/layout/buttons/deactivate-button";
import EditButton from "../../shared/layout/buttons/edit-button";
import ActivateButton from "../../shared/layout/buttons/activate-button";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import { ICompanyCode } from "../../shared/model/company.model";

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

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const cp = history.state["currentPage"];
    if (!cp) return 1;
    return cp;
  });
  const [sizePerPage, setSizePerPage] = useState<number>(() => {
    const sp = history.state["sizePerPage"];
    if (!sp) return 5;
    return sp;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [employeeList, setEmployeeList] = useState<IUser[]>([]);
  const [codeList, setCodeList] = useState<ICompanyCode[]>([]);

  const [searchTerm, setSearchTerm] = useState(() => {
    const st = history.state["searchTerm"];
    if (!st) return "";
    return st;
  });
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);

  useEffect(() => {
    Promise.all([
      // get employees based on company id of current system admin logged in
      getAllEmployees(currentPage, sizePerPage).then((res) => {
        setEmployeeList(res.data);
        setTotalPages(res.totalPages);
      }),
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,POSITION)`
      ).then((res) => {
        setCodeList(res.data);
      })
    ]).finally(() => {
      setLoading((prev) => false);
    });
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setLoading((prev) => true);
      getAllEmployees(currentPage, sizePerPage)
        .then((res) => {
          setEmployeeList(res.data);
          setTotalPages(res.totalPages);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    } else {
      setLoading((prev) => true);
      getAllEmployees(
        currentPage,
        sizePerPage,
        undefined,
        searchTerm ? `contains(fullname,${searchTerm})` : undefined
      )
        .then((res) => {
          setEmployeeList(res.data);
          setTotalPages(res.totalPages);
          if(res.data.length === 0) {
            setCurrentPage(1);
          }
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    }
    history.replaceState({ searchTerm, currentPage, sizePerPage }, "");
  }, [currentPage, sizePerPage, searchTerm]);

  const updateStatus = (employee: IUser, status: string) => {
    // setActionLoading((prev) => [...prev, employee.id]);
    updateEmployee({ ...employee, status })
      .then((res) => {
        toast.success(
          `Employee ${
            status === USER_STATUS.ACTIVE ? "activated" : "deactivated"
          } successfully!`
        );
        setEmployeeList((prev) =>
          prev.map((c) =>
            c.id === res.user.id && c.company_id === res.user.company_id
              ? res.user
              : c
          )
        );
      })
      .catch((err) => {
        toast.error(
          `Error ${
            status === USER_STATUS.ACTIVE ? "activating" : "deactivating"
          } employee`
        );
      })
      .finally(() => {
        // setActionLoading((prev) => prev.filter((id) => id !== code.id));
      });
  };

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
          <label className="text-wrap">{emp.contact_no}</label>
        </Table.Cell>
        <Table.Cell>
          <label>{codeList.find((c) => c.code === emp.position)?.description || "N/A"}</label>
        </Table.Cell>
        <Table.Cell>
          <label>{USER_STATUS[emp?.status || ""] || emp?.status}</label>
        </Table.Cell>
        <Table.Cell className="flex gap-2 justify-center">
          <Button
            size="sm"
            onClick={() => {
              navigate(`/${PATHS.EMPLOYEES}/${PATHS.VIEW_EMPLOYEE}/${emp.id}`);
            }}
          >
            View
          </Button>
          <EditButton
            size="sm"
            onClick={() => {
              navigate(`/${PATHS.EMPLOYEES}/${PATHS.EDIT_EMPLOYEE}/${emp.id}`);
            }}
          />
          {emp.status === USER_STATUS.ACTIVE ? (
            <DeactivateButton
              size="sm"
              onClick={() => updateStatus(emp, USER_STATUS.INACTIVE)}
            />
          ) : (
            <ActivateButton
              size="sm"
              onClick={() => updateStatus(emp, USER_STATUS.ACTIVE)}
            />
          )}
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
          layout="pagination"
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


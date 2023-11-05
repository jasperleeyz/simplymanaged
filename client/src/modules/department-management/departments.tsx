import {
  Button,
  CustomFlowbiteTheme,
  Pagination,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateButton from "../../shared/layout/buttons/create-button";
import { PATHS } from "../../configs/constants";
import React from "react";
import { IDepartment } from "../../shared/model/company.model";
import { get } from "http";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { getAllDepartments } from "../../shared/api/department.api";
import EditButton from "../../shared/layout/buttons/edit-button";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const DepartmentsPage = () => {
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = React.useState<number>(() => {
    const cp = history.state["currentPage"];
    if (!cp) return 1;
    return cp;
  });
  const [sizePerPage, setSizePerPage] = React.useState<number>(() => {
    const sp = history.state["sizePerPage"];
    if (!sp) return 10;
    return sp;
  });
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState(() => {
    const st = history.state["searchTerm"];
    if (!st) return "";
    return st;
  });
  const [departmentList, setDepartmentList] = React.useState<IDepartment[]>([]);

  const generateBody = () => {
    if (departmentList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={4} className="text-center">
            No departments found
          </Table.Cell>
        </Table.Row>
      );
    }

    return departmentList.map((department, idx) => (
      <Table.Row key={idx}>
        <Table.Cell>{department.department_name}</Table.Cell>
        <Table.Cell>
          {department.department_head
            ? `${department.department_head.fullname}`
            : "N/A"}
        </Table.Cell>
        <Table.Cell>{department.employees?.length || 0}</Table.Cell>
        <Table.Cell>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={() =>
                navigate(`./${PATHS.VIEW_DEPARTMENT}/${department.id}`)
              }
            >
              View
            </Button>
            <EditButton
              size="sm"
              onClick={() => {
                navigate(`./${PATHS.EDIT_DEPARTMENT}/${department.id}`);
              }}
            />
          </div>
        </Table.Cell>
      </Table.Row>
    ));
  };

  React.useEffect(() => {
    Promise.all([
      getAllDepartments(
        logged_in_user?.company_id || 0,
        currentPage,
        sizePerPage
      ).then((res) => {
        setDepartmentList(res.data);
        setTotalPages(res.totalPages);
      }),
    ]).finally(() => {
      setLoading((prev) => false);
    });
  }, []);

  React.useEffect(() => {
    if (searchTerm === "") {
      setLoading((prev) => true);
      getAllDepartments(
        logged_in_user?.company_id || 0,
        currentPage,
        sizePerPage
      )
        .then((res) => {
          setDepartmentList(res.data);
          setTotalPages(res.totalPages);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    } else {
      setLoading((prev) => true);
      getAllDepartments(
        logged_in_user?.company_id || 0,
        currentPage,
        sizePerPage,
        undefined,
        searchTerm ? `contains(department_name,${searchTerm})` : undefined
      )
        .then((res) => {
          setDepartmentList(res.data);
          setTotalPages(res.totalPages);
          setCurrentPage((prev) => 1);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    }
    history.replaceState({ currentPage, sizePerPage, searchTerm }, "");
  }, [currentPage, sizePerPage, searchTerm]);

  return (
    <div id="department-main">
      <p className="header">Departments</p>
      <div className="flex justify-between">
        <TextInput
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        <CreateButton
          size="sm"
          onClick={() => {
            navigate(`./${PATHS.ADD_DEPARTMENT}`);
          }}
          value={"Add Department"}
        />
      </div>
      <div id="department-section" className="mt-4 overflow-x-auto">
        <Table theme={customTableTheme}>
          <Table.Head>
            <Table.HeadCell>Department</Table.HeadCell>
            <Table.HeadCell>Head of Department</Table.HeadCell>
            <Table.HeadCell>No. of Employees</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center">
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

export default DepartmentsPage;

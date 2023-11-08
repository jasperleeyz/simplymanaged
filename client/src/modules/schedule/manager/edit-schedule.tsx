import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import {
  Button,
  Checkbox,
  Label,
  Table,
  Modal,
  Select,
  Spinner,
  TextInput,
  CustomFlowbiteTheme,
  Pagination,
} from "flowbite-react";
import { HiUserGroup, HiTicket, HiX } from "react-icons/hi";
import React from "react";
import moment from "moment";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import IUser from "../../../shared/model/user.model";
import { IUserSchedule, IRoster } from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { toast } from "react-toastify";
import { capitalizeString } from "../../../configs/utils";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { getAllEmployees } from "../../../shared/api/user.api";
import EditButton from "../../../shared/layout/buttons/edit-button";
import ActivateButton from "../../../shared/layout/buttons/activate-button";
import DeactivateButton from "../../../shared/layout/buttons/deactivate-button";
import { USER_STATUS } from "../../../configs/constants";
import {
  getNonConflictScheduleUserRoster,
  createUserSchedule,
} from "../../../shared/api/user-schedule.api";
import {
  updateRoster,
} from "../../../shared/api/roster.api";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-300 text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const EditSchedule = () => {
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();
  const location = useLocation();

  const date: Date = location.state?.date;
  const isEdit = location.pathname.endsWith(PATHS.EDIT_SCHEDULE);

  const [employeeList, setEmployeeList] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployeeList, setFilteredEmployeeList] = useState<IUser[]>([]);

  const [currentPage, setCurrentPage] = useState(location?.state?.page || 1);
  const [sizePerPage, setSizePerPage] = useState(
    location?.state?.sizePerPage || 5
  );
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const startIndex = (currentPage - 1) * sizePerPage;
  const endIndex = startIndex + sizePerPage;
  const employeesToDisplay = filteredEmployeeList.slice(startIndex, endIndex);

  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  const roster = location.state?.rosteridx as IRoster;

  const [scheduleDetailsState, setScheduleDetailsState] =
    React.useState<IRoster>(roster);
  useEffect(() => {
    if (scheduleDetailsState.schedules) {
      const employeeData = scheduleDetailsState.schedules
        .filter((schedule) => schedule.user !== undefined)
        .map((schedule) => schedule.user as IUser);

      setScheduleDetailsState((prevState) => {
        return {
          ...prevState,
          employees: employeeData,
        };
      });
    }
  }, [roster]);

  const handleAddOrRemoveEmployee = (user: IUser) => {
    setScheduleDetailsState((prevState) => {
      const updatedEmployees = [...(prevState.employees || [])];
      const updatedSchedules = [...(prevState.schedules || [])];
      const userIndex = updatedEmployees.findIndex((emp) => emp.id === user.id);
      const scheduleIndex = updatedSchedules.findIndex(
        (schedule) => schedule.user_id === user.id
      );
      if (userIndex !== -1) {
        // User is already in the employees array, remove them
        updatedEmployees.splice(userIndex, 1);
        // Remove the associated IUserSchedule
        updatedSchedules.splice(scheduleIndex, 1);
      } else {
        // User is not in the employees array, add them
        updatedEmployees.push(user);
        // Create an associated IUserSchedule
        updatedSchedules.push({
          user_id: user.id,
          user_company_id: user.company_id,
          roster_id: 0,
          start_date: prevState.start_date,
          end_date: prevState.end_date,
          shift: "FULL",
          status: "",
          created_by: globalState?.user?.fullname || "",
          updated_by: globalState?.user?.fullname || "",
        });
      }

      return {
        ...prevState,
        employees: updatedEmployees,
        schedules: updatedSchedules,
      };
    });
  };

  useEffect(() => {
    setLoading((prev) => true);
    getNonConflictScheduleUserRoster(
      scheduleDetailsState.company_id || 0,
      scheduleDetailsState.id || 0,
      scheduleDetailsState.start_date.toString(),
      scheduleDetailsState.end_date.toString(),
      undefined,
      undefined,
      undefined,
      searchTerm ? `contains(position,${searchTerm})` : undefined
    )
      .then((res) => {
        setEmployeeList(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, [
    searchTerm,
    scheduleDetailsState.start_date,
    scheduleDetailsState.end_date,
  ]);

  const setSchedulesToDefault = () => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      employees: [],
      schedules: [],
    }));
  };

  const generateEmployeeList = () => {
    if (employeeList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={2} className="text-center">
            No employees available
          </Table.Cell>
        </Table.Row>
      );
    }

    return employeeList.map((emp, idx) => (
      <Table.Row
        key={idx}
        className="bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <Table.Cell
          style={{ height: "73px" }}
          className="whitespace-nowrap font-medium text-gray-900 dark:text-white"
        >
          {emp.fullname}
        </Table.Cell>
        <Table.Cell>
          <label>{emp.position}</label>
        </Table.Cell>
        <Table.Cell>
          <div className="inline-block">
            {" "}
            {/* Create a container for the button */}
            {scheduleDetailsState.employees &&
            scheduleDetailsState.employees.some(
              (employees) => employees.id === emp.id
            ) ? (
              <Button
                color="failure"
                className="w-full"
                size="sm"
                onClick={() => handleAddOrRemoveEmployee(emp)}
              >
                Remove
              </Button>
            ) : (
              <Button
                color="success"
                className="w-full"
                size="sm"
                onClick={() => handleAddOrRemoveEmployee(emp)}
              >
                Add
              </Button>
            )}
          </div>
        </Table.Cell>
      </Table.Row>
    ));
  };

  const generateSelectedEmployeeList = () => {
    if (
      scheduleDetailsState.employees &&
      scheduleDetailsState.employees.length > 0
    ) {
      return (
        <div>
          <Label
            htmlFor="schedule-employees-details"
            value="Employees' Schedule Details"
          />
          <div id="schedule-employees-details" className="mt-4 overflow-x-auto">
            <Table theme={customTableTheme}>
              <Table.Head>
                <Table.HeadCell>Employee</Table.HeadCell>
                <Table.HeadCell>Position</Table.HeadCell>
                {scheduleDetailsState.type === "SHIFT" && (
                  <Table.HeadCell className="text-center">Shift</Table.HeadCell>
                )}
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {scheduleDetailsState.employees.map((emp, idx) => (
                  <Table.Row
                    key={idx}
                    style={{ height: "73px" }}
                    className="bg-white dark:border-gray-700 dark.bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark-text-white">
                      {emp.fullname}
                    </Table.Cell>
                    <Table.Cell>
                      <label>{emp.position}</label>
                    </Table.Cell>
                    {scheduleDetailsState.type === "SHIFT" && (
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark-text-white">
                        <table>
                          <tbody>
                            <tr>
                              <td style={{ padding: "0 10px" }}>AM</td>
                              <td style={{ padding: "0 10px" }}>PM</td>
                              <td style={{ padding: "0 10px" }}>FULL</td>
                            </tr>
                            <tr>
                              <td style={{ padding: "0 12px" }}>
                                <Checkbox
                                  value={emp.id}
                                  checked={selectEmployeeShift(emp, "AM")}
                                  onChange={() =>
                                    handleEmployeeShiftChange(emp, "AM")
                                  }
                                />
                              </td>
                              <td style={{ padding: "0 12px" }}>
                                <Checkbox
                                  value={emp.id}
                                  checked={selectEmployeeShift(emp, "PM")}
                                  onChange={() =>
                                    handleEmployeeShiftChange(emp, "PM")
                                  }
                                />
                              </td>
                              <td style={{ padding: "0 15px" }}>
                                <Checkbox
                                  value={emp.id}
                                  checked={selectEmployeeShift(emp, "FULL")}
                                  onChange={() =>
                                    handleEmployeeShiftChange(emp, "FULL")
                                  }
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      );
    }
  };

  const submitModal = () => {
    // Get all unique positions from employees
    const uniquePositions = [
      ...new Set(
        scheduleDetailsState.employees &&
          scheduleDetailsState.employees.map((employee) => employee.position)
      ),
    ];
    // Count employees for each unique position
    const positionCounts = uniquePositions.map((position) => ({
      position,
      count:
        scheduleDetailsState.employees &&
        scheduleDetailsState.employees.filter(
          (employee) => employee.position === position
        ).length,
    }));
    const positionMessages = positionCounts.map(
      ({ position, count }) => `${count} ${position}`
    );
    const message = `There are ${positionMessages.join(
      " and "
    )} in the current schedule.`;

    return (
      <Modal show={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <Modal.Header>Confirmation</Modal.Header>
        <Modal.Body>
          <div>
            <p>{message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              onClick={() => {
                setSubmitLoading(true);
              }}
              disabled={submitLoading}
            >
              Yes
            </Button>
            <Button
              color="failure"
              className="w-full"
              size="sm"
              onClick={() => setShowSubmitModal(false)}
              disabled={submitLoading}
            >
              No
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  const [submitLoading, setSubmitLoading] = React.useState(false);

  useEffect(() => {
    if (submitLoading) {
      //update roster
      updateRoster(scheduleDetailsState).finally(() => {
      setSubmitLoading(false);
      setShowSubmitModal(false);
      toast.success("Roster updated");
      navigate(`/${PATHS.SCHEDULE}`, { replace: true });
      // });
    })}
  }, [submitLoading]);

  const selectEmployeeShift = (employee: IUser, shift: string) => {
    // First, find the corresponding IUserSchedule for the user
    const userSchedule =
      scheduleDetailsState.schedules &&
      scheduleDetailsState.schedules.find(
        (schedule) => schedule.user_id === employee.id
      );

    // Check if the user has a schedule and if their schedule shift matches the specified shift
    return !!userSchedule && userSchedule.shift === shift;
  };

  const handleEmployeeShiftChange = (employee: IUser, shift: string) => {
    setScheduleDetailsState((prevState) => {
      // Find the corresponding IUserSchedule for the user
      const updatedSchedules = (prevState.schedules ?? []).map((schedule) => {
        if (schedule.user_id === employee.id) {
          // Update the shift for the user
          return {
            ...schedule,
            shift: shift,
          };
        }
        return schedule;
      });

      return {
        ...prevState,
        schedules: updatedSchedules,
      };
    });
  };

  return (
    <div>
      <p className="header">{`${isEdit ? "Edit" : "Create"} Schedule`}</p>
      <div className="mb-3 flex justify-between items-center">
        <BackButton size="sm" />
      </div>
      <form>
        {/* Schedule Date */}
        <div className="flex">
          <div className="mr-5">
            <Label htmlFor="start-date" value="Start Date" />
            <TextInput
              id="start-date"
              type="date"
              min={moment(new Date()).add(1, "days").format("yyyy-MM-DD")}
              value={moment(scheduleDetailsState.start_date).format(
                "yyyy-MM-DD"
              )}
              onChange={(e) => {
                setSchedulesToDefault();
                setScheduleDetailsState((prev) => ({
                  ...prev,
                  start_date: new Date(e.target.value),
                  end_date: new Date(e.target.value),
                }));
              }}
            />
          </div>
          <div className="mr-5">
            <Label htmlFor="end-date" value="End Date" />
            <TextInput
              id="end-date"
              type="date"
              min={moment(scheduleDetailsState.start_date).format("yyyy-MM-DD")}
              value={moment(scheduleDetailsState.end_date).format("yyyy-MM-DD")}
              onChange={(e) => {
                setScheduleDetailsState((prev) => ({
                  ...prev,
                  end_date: new Date(e.target.value),
                }));
              }}
            />
          </div>
          <div className="mr-5 text-center">
            <Label htmlFor="Shift" value="Shift" />
            <Checkbox
              className="flex w-10 h-10"
              value={scheduleDetailsState.type}
              checked={scheduleDetailsState.type === "SHIFT"}
              onChange={() => {
                if (scheduleDetailsState.type === "SHIFT") {
                  setScheduleDetailsState((prev) => ({
                    ...prev,
                    type: "PROJECT",
                  }));
                } else {
                  setScheduleDetailsState((prev) => ({
                    ...prev,
                    type: "SHIFT",
                  }));
                }
              }}
            />
          </div>
        </div>
        <div className="mb-3">
          <div className="mr-5">
            <Label htmlFor="schedule-employees" value="Employees Available" />
            <div className="flex">
              <TextInput
                placeholder="Search Position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div id="people-section" className="overflow-x-auto flex">
            <div className="my-10 ">
              <Table theme={customTableTheme}>
                <Table.Head>
                  <Table.HeadCell>Employee</Table.HeadCell>
                  <Table.HeadCell>Position</Table.HeadCell>
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
                    generateEmployeeList()
                  )}
                </Table.Body>
              </Table>
            </div>
            <div className="mx-20">{generateSelectedEmployeeList()}</div>
          </div>
          <div className="flex">
            <div className="mx-20">
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
            <div className="mx-80">
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
        </div>
        <div className="mt-12 flex justify-end">
          <Button
            onClick={() => setShowSubmitModal(true)}
            size="sm"
            disabled={
              scheduleDetailsState.employees &&
              scheduleDetailsState.employees.length < 1
            }
          >
            Submit
          </Button>
        </div>
      </form>
      <div>{submitModal()}</div>
    </div>
  );
};

export default EditSchedule;

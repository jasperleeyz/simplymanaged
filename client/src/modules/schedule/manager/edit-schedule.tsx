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
import { getNonConflictScheduleUser, createUserSchedule } from "../../../shared/api/user-schedule.api";

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

  // Calculate the indices for the employees to display based on currentPage and employeesPerPage
  const startIndex = (currentPage - 1) * sizePerPage;
  const endIndex = startIndex + sizePerPage;
  const employeesToDisplay = filteredEmployeeList.slice(startIndex, endIndex);

 const [scheduleDetailsState, setScheduleDetailsState] = React.useState<IRoster>({
  id: 0,
  company_id: globalState?.user?.company_id || 0,
  location_id: 0,
  department_id: globalState?.user?.department_id || 0,
  start_date: moment(new Date()).add(1, 'days').startOf("day").toDate(),
  end_date: moment(new Date()).add(1, 'days').endOf("day").toDate(),
  type: '',
  created_by: globalState?.user?.fullname || '',
  updated_by: globalState?.user?.fullname || '',
  employees: [],
  schedules: [],
});

  const handleAddOrRemoveEmployee = (user: IUser) => {
    setScheduleDetailsState((prevState) => {
      const updatedEmployees = [...(prevState.employees || [])];
      const updatedSchedules = [...(prevState.schedules || [])];
      const userIndex = updatedEmployees.findIndex((emp) => emp.id === user.id);
      const scheduleIndex = updatedSchedules.findIndex((schedule) => schedule.user_id === user.id);
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
          shift: 'FULL',
          status: '',
          created_by: globalState?.user?.fullname || '',
          updated_by: globalState?.user?.fullname || '',
        });
      }
  
      return {
        ...prevState,
        employees: updatedEmployees,
        schedules: updatedSchedules
      };
    });
  };

  useEffect(() => {
    setLoading((prev) => true);
    getNonConflictScheduleUser(
      0,
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
      schedules: []
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
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {emp.fullname}
        </Table.Cell>
        <Table.Cell>
          <label>{emp.position}</label>
        </Table.Cell>
        <Table.Cell>
          <div className="inline-block">
            {" "}
            {/* Create a container for the button */}
            {scheduleDetailsState.employees && scheduleDetailsState.employees.some(
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
                onClick={() =>handleAddOrRemoveEmployee(emp)}
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
    if (scheduleDetailsState.employees && scheduleDetailsState.employees.length > 0) {
      return (
        <div className="mb-3">
          <Label
            htmlFor="schedule-employees-details"
            value="Employees' Schedule Details"
          />
          <div id="schedule-employees-details" className="mt-4 overflow-x-auto">
        <Table theme={customTableTheme}>
          <Table.Head>
            <Table.HeadCell>Employee</Table.HeadCell>
            <Table.HeadCell>Position</Table.HeadCell>
            <Table.HeadCell className="text-center">Shift</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {scheduleDetailsState.employees.map((emp, idx) => (
              <Table.Row
                key={idx}
                className="bg-white dark:border-gray-700 dark.bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark-text-white">
                  {emp.fullname}
                </Table.Cell>
                <Table.Cell>
                  <label>{emp.position}</label>
                </Table.Cell>
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
    const uniquePositions = [...new Set(scheduleDetailsState.employees && scheduleDetailsState.employees.map(employee => employee.position))];
    // Count employees for each unique position
    const positionCounts = uniquePositions.map(position => ({
      position,
      count: scheduleDetailsState.employees && scheduleDetailsState.employees.filter(employee => employee.position === position).length,
    }));
    const positionMessages = positionCounts.map(({ position, count }) => `${count} ${position}`);
    const message = `There are ${positionMessages.join(' and ')} in the current schedule.`;
  
    <Modal show={showModal} dismissible onClose={() => setShowModal(false)}>
          <Modal.Header>Comfirmation</Modal.Header>
          <Modal.Body>
            <div>
              <p>
              {message}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full md:w-1/2 ms-auto flex justify-center">
              <Button
                color="success"
                className="w-full mr-3"
                size="sm"
                onClick={() => autoAssignPersonnel()}
              >
                Yes
              </Button>
              <Button
                color="failure"
                className="w-full"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                No
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
  }

  const [errorMessage, setErrorMessage] = React.useState(() => {
    return {
      date: "",
    };
  });

  const [showModal, setShowModal] = React.useState(false);

  const [showEmpProps, setShowEmpProps] = React.useState({
    show: false,
    emp: {} as IUser | undefined,
  });

  // TODO: to retrieve employees from API // should return only employees that are
  // available or meet the schedule criteria
  const employees: IUser[] = [
    // {
    //   id: 2,
    //   fullname: "JOHN WICK",
    //   email: "JOHNWICK@SIMPLYMANAGED.COM",
    //   phoneNo: "88888888",
    //   role: "E",
    //   position: "MANAGER",
    //   employmentType: "FULL-TIME",
    // },
    // {
    //   id: 3,
    //   name: "DEADPOOL",
    //   email: "DEADPOOL@SIMPLYMANAGED.COM",
    //   phoneNo: "77777777",
    //   role: "E",
    //   position: "BARISTA",
    //   employmentType: "PART-TIME",
    // },
    // {
    //   id: 4,
    //   name: "HARRY POTTER",
    //   email: "HARRYPOTTER@SIMPLYMANAGED.COM",
    //   phoneNo: "66666666",
    //   role: "E",
    //   position: "SERVER",
    //   employmentType: "PART-TIME",
    // },
  ];

  const autoAssignPersonnel = () => {
    setShowModal(false);
    // TODO: to invoke API to fill schedule
    // API should be given selected date and template
    setScheduleDetailsState((prev) => ({
      ...prev,
      employeesSelected: [
        { ...employees[0], shift: "PM", attendance: "N" },
        { ...employees[1], shift: "FULL", attendance: "N" },
      ],
    }));
  };

  const updateEmployeeShift = (e, employee: IUserSchedule) => {
    // const updatedArray = [...scheduleDetailsState.employeesSelected];
    // updatedArray.forEach((emp) => {
    //   if (emp.id === employee.id) {
    //     emp.shift = e.target.value;
    //   }
    // });
    // setScheduleDetailsState((prev) => ({
    //   ...prev,
    //   employeesSelected: [...updatedArray],
    // }));
  };

  const isEmpSelected = (employee: IUser) => {
    // return (
    //   scheduleDetailsState.employeesSelected.find(
    //     (emp) => emp.id === employee.id
    //   ) !== undefined
    // );
    return false;
  };

  const selectEmployeeShift = (employee: IUser, shift: string) => {
    // First, find the corresponding IUserSchedule for the user
    const userSchedule = scheduleDetailsState.schedules && scheduleDetailsState.schedules.find(
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

  //  TODO: to invoke API to create schedule
  const createSchedule = () => {
    if (isEdit) { 
      // setGlobalState((prev) => ({
      //   ...prev,
      //   schedule: prev.schedule.map((s) => {
      //     if (s.id === scheduleDetailsState.id) {
      //       return scheduleDetailsState;
      //     } else {
      //       return s;
      //     }
      //   }),
      // }));

      toast.success("Schedule updated successfully");
    } else {
      if (scheduleDetailsState.schedules) {
        scheduleDetailsState.schedules.forEach((schedule) => {
          createUserSchedule(schedule);
        });
      }
      const id = globalState?.schedule?.length
        ? globalState?.schedule?.length + 1
        : 1;

      // setGlobalState((prev) => ({
      //   ...prev,
      //   // TODO: add schedule to global state
      //   schedule: [
      //     ...prev.schedule,
      //     { ...scheduleDetailsState, id: id, attendance: "N" },
      //   ],
      // }));

      toast.success("Schedule created successfully");
    }

    navigate(`/${PATHS.SCHEDULE}`, { replace: true });
  };

  return (
    <div>
      <p className="header">{`${isEdit ? "Edit" : "Create"} Schedule`}</p>
      <div className="mb-3 flex justify-between">
        <BackButton size="sm" />
      </div>
      <form>
        {/*
        {/* Schedule Template/Type }
        <div className="mb-3">
          <Label htmlFor="schedule-template" value="Template" />
          <Select
            id="schedule-template"
            // value={scheduleDetailsState.scheduleTemplate}
            onChange={(e) =>
              setScheduleDetailsState((prev) => ({
                ...prev,
                scheduleTemplate: e.target.value,
              }))
            }
            disabled
          >
            {/* TODO: populate templates  }
          </Select>
          <div>
            <p>Employees needed: 2</p>
            <p></p>
          </div>
        </div>
        */}

        {/* Schedule Location */}
        {/*<div className="mb-3">
          <Label htmlFor="schedule-location" value="Location" />
          <Select
            id="schedule-location"
            value={scheduleDetailsState.location?.name}
            onChange={(e) => {
              // setScheduleDetailsState((prev) => ({
              //   ...prev,
              //   location: e.target.value,
              // }));
            }}
          >
            {globalState?.locations?.map((l, idx) => (
              <option key={idx} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        */}
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
            />
          </div>
          <div className="mr-5">
            <Label htmlFor="end-date" value="End Date" />
            <TextInput
              id="end-date"
              type="date"
              min={moment(scheduleDetailsState.start_date).format("yyyy-MM-DD")}
              value={moment(scheduleDetailsState.end_date).format("yyyy-MM-DD")}
            />
          </div>
        </div>
        <div className="mb-3">
          <Label htmlFor="schedule-employees" value="Employees Available" />
          <div className="flex justify-between">
            <TextInput
              placeholder="Search Position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div id="people-section" className="mt-4 overflow-x-auto">
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

          <div className="mx-10">
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
{/*
        <div className="mb-3">
          <Label htmlFor="schedule-date" value="Date" />
          <TextInput
            id="schedule-date"
            type="date"
            min={moment(new Date()).add(1, "days").format("yyyy-MM-DD")}
            value={moment(scheduleDetailsState.startDate).format("yyyy-MM-DD")}
            helperText={
              <span className="error-message">{errorMessage.date}</span>
            }
            onChange={(e) => {
              if (moment(e.target.value).isBefore(moment(new Date()))) {
                setErrorMessage((prev) => ({
                  ...prev,
                  date: "Date cannot be before today",
                }));
              } else {
                setErrorMessage((prev) => ({
                  ...prev,
                  date: "",
                }));
              }
              setScheduleDetailsState((prev) => ({
                ...prev,
                date: new Date(e.target.value),
              }));
            }}
          />
        </div>
        {/* Select Employees 
        <div className="mb-3">
          <Label htmlFor="schedule-employees" value="Employees Available" />
          <div id="schedule-employees">
            {employeeList.map((emp, idx) => {
              return (
                <div key={idx}>
                  <Checkbox
                    value={emp.id}
                    checked={isEmpSelected(emp)}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        // setScheduleDetailsState((prev) => ({
                        //   ...prev,
                        //   employeesSelected: [
                        //     ...prev.employeesSelected,
                        //     { ...emp, shift: "AM", attendance: "N" },
                        //   ],
                        // }));
                      } else {
                        // setScheduleDetailsState((prev) => ({
                        //   ...prev,
                        //   employeesSelected: prev.employeesSelected.filter(
                        //     (_, i) => {
                        //       return _.id !== emp.id;
                        //     }
                        //   ),
                        // }));
                      }
                    }}
                  />
                  <Label
                    className="ml-3 underline underline-offset-2 "
                    onClick={() => {
                      setShowEmpProps((prev) => ({ show: true, emp: emp }));
                    }}
                  >
                    {capitalizeString(emp.fullname)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
        {/* Select employee schedule details (shifts/working hours) }
        <div className="mb-3">
          <Label
            htmlFor="schedule-employees-details"
            value="Employees' Schedule Details"
          />
          <div id="schedule-employees-details" className="mt-4 overflow-x-auto">
            
            {/* {scheduleDetailsState.employeesSelected.map((emp, idx) => {
              return (
                <div key={idx} className="flex items-center mb-3">
                  <div className="w-1/4">
                    <p>{capitalizeString(emp.name)}</p>
                  </div>
                  <div className="w-3/4 flex items-center">
                    <p className="mr-3">Shift/Period:</p>
                    <Select
                      value={emp.shift}
                      onChange={(e) => updateEmployeeShift(e, emp)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                      <option value="FULL">Full shift</option>
                    </Select>
                  </div>
                </div>
              );
            })} 
          </div>
        </div>
        */}
        {generateSelectedEmployeeList()}

        <div className="mt-12 flex justify-end">
          <Button onClick={() => createSchedule()} size="sm">
            Submit
          </Button>
        </div>
      </form>

      {/* Modal for auto assign personnel */}
      {showModal && (
        <Modal show={showModal} dismissible onClose={() => setShowModal(false)}>
          <Modal.Header>Auto Assign Personnel?</Modal.Header>
          <Modal.Body>
            <div>
              <p>
                Any employees previously selected will be cleared and system
                will re-assign the employees for this schedule.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full md:w-1/2 ms-auto flex justify-center">
              <Button
                color="success"
                className="w-full mr-3"
                size="sm"
                onClick={() => autoAssignPersonnel()}
              >
                Yes
              </Button>
              <Button
                color="failure"
                className="w-full"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                No
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal for showing emp details */}
      {showEmpProps.show && (
        <Modal
          show={showEmpProps.show}
          dismissible
          onClose={() => setShowEmpProps({ show: false, emp: undefined })}
        >
          <Modal.Header></Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-2">
              <LabeledField
                id="emp-name"
                labelValue={"Name"}
                value={capitalizeString(showEmpProps.emp?.fullname)}
              />
              <LabeledField
                id="emp-position"
                labelValue={"Position"}
                value={capitalizeString(showEmpProps.emp?.position)}
              />
              {/* <p>{showEmpProps?.emp?.}</p> */}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default EditSchedule;

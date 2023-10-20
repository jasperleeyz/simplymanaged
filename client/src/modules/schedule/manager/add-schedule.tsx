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
import { getAllUserSchedule } from "../../../shared/api/user-schedule.api";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-300 text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const AddSchedule = () => {
  // TODO: can retrieve schedule templates from global state to populate dropdownlist
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();
  const location = useLocation();

  const date: Date = location.state?.date;
  const isEdit = location.pathname.endsWith(PATHS.EDIT_SCHEDULE);

  const [currentPage, setCurrentPage] = useState(location?.state?.page || 1);
  const [sizePerPage, setSizePerPage] = useState(
    location?.state?.sizePerPage || 10
  );
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [employeeList, setEmployeeList] = useState<IUser[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);

  //TEMP VARIABLE
  const temporaryPostitions = ["Programmer", "Manager", "Designer"];
  const temporaryUsers = [
    { id: 1, name: "John Doe", position: "Manager" },
    { id: 2, name: "Jane Smith", position: "Manager" },
    { id: 3, name: "Emily Davis", position: "Designer" },
    { id: 4, name: "David Anderson", position: "Designer" },
    { id: 5, name: "Sarah Lee", position: "Programmer" },
    { id: 6, name: "Brian Brown", position: "Programmer" },
    { id: 7, name: "Jessica Clark", position: "Programmer" },
    { id: 8, name: "Andrew Wilson", position: "Designer" },
    { id: 9, name: "Laura Taylor", position: "Manager" },
  ];

  const newStartDate = "2023-10-20"; // Replace with your desired start date
  const newEndDate = "2023-10-21";   // Replace with your desired end date

  const [addedUsers, setAddedUsers] = useState<IUser[]>([]); // Store added users separately

  const handleAddOrRemoveUser = (user: IUser) => {
    if (addedUsers.some((addedUser) => addedUser.id === user.id)) {
      // User is already added, remove them
      setAddedUsers((prevUsers) => prevUsers.filter((addedUser) => addedUser.id !== user.id));
    } else {
      // User is not added, add them
      setAddedUsers((prevUsers) => [...prevUsers, user]);
    }
  };

  useEffect(() => {
    setLoading((prev) => true);
    getAllUserSchedule(
      0,
      newStartDate,
      newEndDate,
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
    }, [searchTerm]);

  /*useEffect(() => {
    setLoading((prev) => true);
    getAllEmployees(
      globalState?.user?.company_id || 0,
      1,
      sizePerPage,
      undefined,
      searchTerm ? `contains(position,${searchTerm})` : undefined
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
*/


  const generateBody = () => {
    if (employeeList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={2} className="text-center">
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
          <label>{emp.position}</label>
        </Table.Cell>
        <Button
                color="success"
                className="w-full mr-3"
                size="sm"
                onClick={() => autoAssignPersonnel()}
              >
                Add
              </Button>
      </Table.Row>
    ));
  };

  const [scheduleDetailsState, setScheduleDetailsState] =
    React.useState<IRoster>(() => {
      if (location.state?.schedule) {
        return location.state.schedule;
      } else {
        return {
          id: 0,
          scheduleTemplate: "",
          date: date || moment(new Date()).add(1, "days").toDate(),
          employeesSelected: [],
          location: "Toa Payoh",
        };
      }
    });

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
        <Button
          size="sm"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <p>Auto Assign Personnel</p>
          <HiUserGroup className="ml-2 my-auto" />
        </Button>
      </div>
      <div>
      <input
        type="text"
        placeholder="Search by position..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {employeeList.map((user) => (
          <li key={user.id}>
            {user.fullname} - {user.position}
            <button onClick={() => handleAddOrRemoveUser(user)}>
              {addedUsers.some((addedUser) => addedUser.id === user.id) ? 'Remove' : 'Add'}
            </button>
          </li>
        ))}
      </ul>
      <h2>Added Users</h2>
      <ul>
        {addedUsers.map((addedUser) => (
          <li key={addedUser.id}>{addedUser.fullname} - {addedUser.position}</li>
        ))}
      </ul>
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
              value={moment(scheduleDetailsState.startDate).format(
                "yyyy-MM-DD"
              )}
              helperText={
                <span className="error-message">{errorMessage.date}</span>
              }
              onChange={(e) => {
                if (moment(e.target.value).isBefore(moment(new Date()))) {
                  setErrorMessage((prev) => ({
                    ...prev,
                    startDate: "Start date cannot be before today",
                  }));
                } else {
                  setErrorMessage((prev) => ({
                    ...prev,
                    startDate: "",
                  }));
                }
                setScheduleDetailsState((prev) => ({
                  ...prev,
                  startDate: new Date(e.target.value),
                }));
              }}
            />
          </div>
          <div className="mr-5">
            <Label htmlFor="end-date" value="End Date" />
            <TextInput
              id="end-date"
              type="date"
              min={moment(scheduleDetailsState.startDate)
                .add(1, "days")
                .format("yyyy-MM-DD")}
              value={moment(scheduleDetailsState.endDate).format("yyyy-MM-DD")}
              helperText={
                <span className="error-message">{errorMessage.date}</span>
              }
              onChange={(e) => {
                if (
                  moment(e.target.value).isBefore(
                    moment(scheduleDetailsState.startDate)
                  )
                ) {
                  setErrorMessage((prev) => ({
                    ...prev,
                    endDate: "End date cannot be before the start date",
                  }));
                } else {
                  setErrorMessage((prev) => ({
                    ...prev,
                    endDate: "",
                  }));
                }
                setScheduleDetailsState((prev) => ({
                  ...prev,
                  endDate: new Date(e.target.value),
                }));
              }}
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
                  generateBody()
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
        {/* Select Employees */}
        <div className="mb-3">
          <Label htmlFor="schedule-employees" value="Employees Available" />
          <div id="schedule-employees">
            {employees.map((emp, idx) => {
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
        {/* Select employee schedule details (shifts/working hours) */}
        <div className="mb-3">
          <Label
            htmlFor="schedule-employees-details"
            value="Employees' Schedule Details"
          />
          <div id="schedule-employees-details">
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
            })} */}
          </div>
        </div>
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

export default AddSchedule;

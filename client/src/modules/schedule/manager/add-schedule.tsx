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
import {
  IUserSchedule,
  IRoster,
  IRosterTemplate,
  IRosterTemplatePosition,
  IRosterPosition,
} from "../../../shared/model/schedule.model";
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
  getNonConflictScheduleUser,
  createUserSchedule,
} from "../../../shared/api/user-schedule.api";
import {
  getRosterTemplate,
  getRosterTemplatePosition,
  createRosterTemplate,
  deleteRosterTemplate,
  createRoster,
} from "../../../shared/api/roster.api";
import CreateScheduleModal from "./create-schedule-modal";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-300 text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const AddSchedule = () => {
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();
  const location = useLocation();

  const date: Date = location.state?.date;

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

  const [showAutoAssignModal, setAutoAssignShowModal] = React.useState(false);

  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  const [scheduleDetailsState, setScheduleDetailsState] =
    React.useState<IRoster>({
      company_id: globalState?.user?.company_id || 0,
      location_id: 0,
      department_id: globalState?.user?.department_id || 0,
      start_date: date || moment(new Date()).add(1, "days").startOf("day").toDate(),
      end_date: date || moment(new Date()).add(1, "days").endOf("day").toDate(),
      type: "PROJECT",
      created_by: globalState?.user?.fullname || "",
      updated_by: globalState?.user?.fullname || "",
      employees: [],
      schedules: [],
    });

  const handleAddOrRemoveEmployee = (user: IUser) => {
    setScheduleDetailsState((prevState) => {
      const updatedEmployees = [...(prevState.employees || [])];
      const updatedSchedules = [...(prevState.schedules || [])];
      const userIndex = updatedEmployees.findIndex((emp) => emp.id === user.id);
      const scheduleIndex = updatedSchedules.findIndex(
        (schedule) => schedule.user_id === user.id
      );
      const updatedPosition = [...(prevState.positions || [])];
      const posCount = updatedPosition.findIndex((pos) => pos.position === user.position);
      if (userIndex !== -1) {
        // User is already in the employees array, remove them
        updatedEmployees.splice(userIndex, 1);
        // Remove the associated IUserSchedule
        updatedSchedules.splice(scheduleIndex, 1);
      } else {
          const maxCount = updatedPosition[posCount].count;
          const currentCount = updatedEmployees.filter(
            (emp) => emp.position === user.position
          ).length;
          if (currentCount < maxCount || 0) {
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
          else {
          // Handle case when roster position is at its maximum
          //console.log(`Maximum allowed count.`);
        }
      }

      return {
        ...prevState,
        employees: updatedEmployees,
        schedules: updatedSchedules,
      };
    });
  };

  const [createScheduleModal, setCreateScheduleModal] = React.useState(true);
  const [rosterPosition, setRosterPosition] = React.useState<IRosterPosition[]>(
    []
  );
  const [rosterType, setRosterType] = React.useState("PROJECT")
  const [locationId, setLocationId] = React.useState(0)

  const modalProps = {
    createScheduleModal,
    setCreateScheduleModal,
    rosterPosition,
    setRosterPosition,
    rosterType,
    setRosterType,
    locationId,
    setLocationId
  };

  useEffect(() => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      positions: rosterPosition,
    }));
  }, [rosterPosition]);

  useEffect(() => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      type: rosterType,
    }));
  }, [rosterType]);

  useEffect(() => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      location_id: locationId,
    }));
  }, [locationId]);

  console.log(scheduleDetailsState)

  const [templateList, setTemplateList] = useState<IRosterTemplate[]>([]);
  useEffect(() => {
    //setLoading((prev) => true);
    getRosterTemplate(globalState?.user?.company_id || 0)
      .then((res) => {
        setTemplateList(res.data);
      })
      .finally(() => {
        //  setLoading((prev) => false);
      });
  }, []);

  useEffect(() => {
    setLoading((prev) => true);
    getNonConflictScheduleUser(
      scheduleDetailsState.company_id|| 0,
      scheduleDetailsState.department_id || 0,
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
      createRoster(scheduleDetailsState).finally(() => {
        setSubmitLoading(false);
        setShowSubmitModal(false);
        toast.success("Roster created");
        navigate(`/${PATHS.SCHEDULE}`, { replace: true });
      });
    }
  }, [submitLoading]);

  const autoAssignModal = () => {
    const [positionCount, setPositionCount] = useState({});

    useEffect(() => {
      if (scheduleDetailsState.positions) {
        const updatedPositionCount = {};
        scheduleDetailsState.positions.forEach((emp, idx) => {
          updatedPositionCount[emp.position] = emp.count;
        });
        setPositionCount(updatedPositionCount);
      }
    }, [scheduleDetailsState.positions]);

    const [selectedPosition, setSelectedPosition] = useState("");

    useEffect(() => {
      setSelectedPosition(Object.keys(positionCount)[0]);
    }, [positionCount]);

    const [positionSelectedCount, setPositionSelectedCount] =
      React.useState(positionCount);

    const incrementSelectedCount = (position) => {
      const currentCount = positionSelectedCount[position] || 0;
      const limit = positionCount[position] || 0; // Get the position count limit
      if (currentCount < limit) {
        setPositionSelectedCount((prevPositionSelectedCount) => ({
          ...prevPositionSelectedCount,
          [position]: currentCount + 1,
        }));
      }
    };

    const decrementSelectedCount = (position) => {
      const currentCount = positionSelectedCount[position] || 0;
      if (currentCount > 0) {
        setPositionSelectedCount((prevPositionSelectedCount) => ({
          ...prevPositionSelectedCount,
          [position]: currentCount - 1,
        }));
      }
    };
    return (
      <Modal
        show={showAutoAssignModal}
        onClose={() => {
          setAutoAssignShowModal(false);
          setPositionSelectedCount(positionCount);
        }}
      >
        <Modal.Header>Auto Assign</Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Select onChange={(e) => setSelectedPosition(e.target.value)}>
              {Object.keys(positionCount).map((position, index) => (
                <option key={index} value={position}>
                  {position}
                </option>
              ))}
            </Select>
            {selectedPosition !== "" ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Button
                  style={{ marginLeft: "300px" }}
                  onClick={() => decrementSelectedCount(selectedPosition)}
                >
                  -
                </Button>
                <Button
                  style={{ marginLeft: "10px" }}
                  onClick={() => incrementSelectedCount(selectedPosition)}
                >
                  +
                </Button>
              </div>
            ) : null}
          </div>
          {selectedPosition !== "" ? (
            <div className="my-2">
              {Object.keys(positionSelectedCount).map((position, index) => (
                <div key={index}>
                  {position} - {positionSelectedCount[position]}
                </div>
              ))}
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex justify-center">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              onClick={() => {
                autoAssignPersonnel(positionSelectedCount);
                setPositionSelectedCount(positionCount);
              }}
            >
              Yes
            </Button>
            <Button
              color="failure"
              className="w-full"
              size="sm"
              onClick={() => {
                setAutoAssignShowModal(false);
                setPositionSelectedCount(positionCount);
              }}
            >
              No
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  const [errorMessage, setErrorMessage] = React.useState(() => {
    return {
      date: "",
    };
  });

  const [showEmpProps, setShowEmpProps] = React.useState({
    show: false,
    emp: {} as IUser | undefined,
  });

  const autoAssignPersonnel = (positionSelectedCount) => {
    setAutoAssignShowModal(false);
    const newState: IRoster = {
      ...scheduleDetailsState,
      employees: [],
      schedules: [],
    };

    // Loop through the selected positions and auto-assign employees
    Object.keys(positionSelectedCount).forEach((position) => {
      const selectedCount = positionSelectedCount[position];
      const availableEmployees: IUser[] = employeeList.filter(
        (emp) => emp.position === position
      );
      const updatedSchedules: IUserSchedule[] = [];

      if (availableEmployees.length > 0 && selectedCount > 0) {
        const selectedEmployees: IUser[] = [];
        const shuffledCandidates: IUser[] = [...availableEmployees];
        for (let i = 0; i < selectedCount; i++) {
          if (shuffledCandidates.length === 0) {
            break; // If no more candidates are available, break the loop
          }
          const randomIndex = Math.floor(
            Math.random() * shuffledCandidates.length
          );
          const selectedEmployee: IUser = shuffledCandidates.splice(
            randomIndex,
            1
          )[0];
          selectedEmployees.push(selectedEmployee);
          // if subscription push shift pref
          //else push full
          updatedSchedules.push({
            user_id: selectedEmployee.id,
            user_company_id: selectedEmployee.company_id,
            roster_id: 0,
            start_date: newState.start_date,
            end_date: newState.end_date,
            shift: "FULL",
            status: "",
            created_by: globalState?.user?.fullname || "",
            updated_by: globalState?.user?.fullname || "",
          });
        }
        newState.employees = [
          ...(newState.employees ?? []),
          ...selectedEmployees,
        ];
        newState.schedules = [
          ...(newState.schedules ?? []),
          ...updatedSchedules,
        ];
      }
    });
    // Update the state with the auto-assigned employees
    setScheduleDetailsState(newState);
  };

  const useSelectedTemplate = (selectedTemplate: IRosterTemplate) => {
    const newState: IRoster = {
      ...scheduleDetailsState,
      employees: [],
      schedules: [],
    };

    let errorOccurred = false;

    // Loop through the selected positions and auto-assign employees
    if (selectedTemplate.positions) {
      selectedTemplate.positions.forEach((positionData) => {
        const selectedCount = positionData.count;
        const position = positionData.position;

        const availableEmployees: IUser[] = employeeList.filter(
          (emp) => emp.position === position
        );
        const updatedSchedules: IUserSchedule[] = [];

        if (availableEmployees.length > 0 && selectedCount > 0) {
          const selectedEmployees: IUser[] = [];
          const shuffledCandidates: IUser[] = [...availableEmployees];
          for (let i = 0; i < selectedCount; i++) {
            if (shuffledCandidates.length === 0) {
              toast.error(`Not enough employees for position: ${position}`);
              errorOccurred = true; // If no more candidates are available, break the loop
            }
            const randomIndex = Math.floor(
              Math.random() * shuffledCandidates.length
            );
            const selectedEmployee: IUser = shuffledCandidates.splice(
              randomIndex,
              1
            )[0];
            selectedEmployees.push(selectedEmployee);
            // if subscription push shift pref
            //else push full
            updatedSchedules.push({
              user_id: selectedEmployee.id,
              user_company_id: selectedEmployee.company_id,
              roster_id: 0,
              start_date: newState.start_date,
              end_date: newState.end_date,
              shift: "FULL",
              status: "",
              created_by: globalState?.user?.fullname || "",
              updated_by: globalState?.user?.fullname || "",
            });
          }
          newState.employees = [
            ...(newState.employees ?? []),
            ...selectedEmployees,
          ];
          newState.schedules = [
            ...(newState.schedules ?? []),
            ...updatedSchedules,
          ];
        } else {
          toast.error(`Not enough employees for position: ${position}`);
          errorOccurred = true;
        }
      });
    }
    // Update the state with the auto-assigned employees
    setScheduleDetailsState(newState);
    return !errorOccurred;
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
      <p className="header">Create Schedule</p>
      <div className="mb-3 flex justify-between items-center">
        <BackButton size="sm" />

        <div className="flex items-center">
          <Button
            size="sm"
            onClick={() => {
              setAutoAssignShowModal(true);
            }}
          >
            <p>Auto Assign</p>
            <HiUserGroup className="ml-2 my-auto" />
          </Button>
        </div>
      </div>
      <form>
        {/*
        {/* Schedule Template/Type )}
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
              helperText={
                <span className="error-message">{errorMessage.date}</span>
              }
              onChange={(e) => {
                setSchedulesToDefault();
                if (moment(e.target.value).isBefore(moment(new Date()))) {
                  setErrorMessage((prev) => ({
                    ...prev,
                    start_date: "Start date cannot be before today",
                  }));
                } else {
                  setErrorMessage((prev) => ({
                    ...prev,
                    start_date: "",
                  }));
                }
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
              helperText={
                <span className="error-message">{errorMessage.date}</span>
              }
              onChange={(e) => {
                //setSchedulesToDefault();
                if (
                  moment(e.target.value).isBefore(
                    moment(scheduleDetailsState.start_date)
                  )
                ) {
                  setErrorMessage((prev) => ({
                    ...prev,
                    end_date: "End date cannot be before the start date",
                  }));
                } else {
                  setErrorMessage((prev) => ({
                    ...prev,
                    end_date: "",
                  }));
                }
                setScheduleDetailsState((prev) => ({
                  ...prev,
                  end_date: new Date(e.target.value),
                }));
              }}
            />
          </div>
          <div className="mr-5 text-center">
            {/*<Label htmlFor="Shift" value="Shift" />
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
            */}
          </div>
          {templateList.length > 0 && (
            <div style={{ marginLeft: "auto" }}>
              <Label htmlFor="employees-template" value="Template" />
              <Select
                onChange={(e) => {
                  const selectedTemplateName = e.target.value;
                  const selectedTemplateObject = templateList.find(
                    (template) => template.name === selectedTemplateName
                  );
                  if (selectedTemplateObject)
                    if (!useSelectedTemplate(selectedTemplateObject))
                      e.target.value = "-";
                  if (e.target.value === "-") {
                    const newState: IRoster = {
                      ...scheduleDetailsState,
                      employees: [],
                      schedules: [],
                    };
                    setScheduleDetailsState(newState);
                  }
                }}
              >
                <option value="-">-</option>
                {templateList.map((template, index) => (
                  <option key={index} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
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

      {/* Modal for auto assign personnel */}
      {/*
      {showAutoAssignModal && (
        <Modal
          show={showAutoAssignModal}
          dismissible
          onClose={() => setAutoAssignShowModal(false)}
        >
          <Modal.Header>Auto Assign</Modal.Header>
          <Modal.Body>
            <div>
              <p>
                Any employees previously selected will be cleared and system
                will re-assign the employees for this schedule.
              </p>
            </div>
            <Button onClick={() => createSchedule()} size="sm">
              Submit
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full md:w-1/2 ms-auto flex justify-center">
              <Button
                color="success"
                className="w-full mr-3"
                size="sm"
                onClick={() => autoAssignPersonnel('asd')}
              >
                Yes
              </Button>
              <Button
                color="failure"
                className="w-full"
                size="sm"
                onClick={() => setAutoAssignShowModal(false)}
              >
                No
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
      */}
      <div>
        {autoAssignModal()}
        {submitModal()}
      </div>

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
      {<CreateScheduleModal {...modalProps} />}
    </div>
  );
};

export default AddSchedule;

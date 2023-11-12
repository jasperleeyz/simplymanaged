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
  Avatar,
} from "flowbite-react";
import { HiUserGroup, HiX } from "react-icons/hi";
import React from "react";
import moment from "moment";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import IUser from "../../../shared/model/user.model";
import {
  IUserSchedule,
  IRoster,
  IRosterTemplate,
  IRosterPosition,
} from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { toast } from "react-toastify";
import { capitalizeString } from "../../../configs/utils";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { getNonConflictScheduleUser } from "../../../shared/api/user-schedule.api";
import {
  getRosterTemplate,
  createRoster,
} from "../../../shared/api/roster.api";
import CreateScheduleModal from "./create-schedule-modal";
import {
  getSubscriptionModelByCompanyId,
  getSubscriptionModelById,
} from "../../../shared/api/subscription.api";
import { ICompanyCode } from "../../../shared/model/company.model";
import { getAllCompanyCodes } from "../../../shared/api/company-code.api";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-300 text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

interface EmployeePreferences {
  id: number;
  day: string[];
  shift: string[];
}

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

  const [subscription, SetSubscription] = React.useState(false);

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
      start_date:
        date || moment(new Date()).add(1, "days").startOf("day").toDate(),
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
      const posCount = updatedPosition.findIndex(
        (pos) => pos.position === user.position
      );
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
            shift: empShift,
            status: "",
            created_by: globalState?.user?.fullname || "",
            updated_by: globalState?.user?.fullname || "",
          });
        } else {
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
  const [empShift, setEmpShift] = React.useState("FULL");
  const [createScheduleModal, setCreateScheduleModal] = React.useState(true);
  const [rosterPosition, setRosterPosition] = React.useState<IRosterPosition[]>(
    []
  );
  const [rosterType, setRosterType] = React.useState("SHIFT");
  const [locationId, setLocationId] = React.useState(0);
  const [rosterSetting, setRosterSettings] = React.useState(true);
  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);

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

  const [searchFilterEmployeeList, setSearchFilterEmployeeList] = useState<IUser[]>([]);

  useEffect(() => {
    // When the searchTerm changes, update the filteredEmployees state.
    const filtered = filteredEmployeeList.filter((emp) =>
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchFilterEmployeeList(filtered);
  }, [searchTerm, filteredEmployeeList]);

  useEffect(() => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      location_id: locationId,
    }));
  }, [locationId]);

  const [templateList, setTemplateList] = useState<IRosterTemplate[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<
    IRosterTemplate[]
  >([]);
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
    const newFilteredTemplateList = templateList.filter((template) => {
      return template.roster_type === scheduleDetailsState.type;
    });
    setFilteredTemplateList(newFilteredTemplateList);
  }, [templateList, scheduleDetailsState.type]);

  useEffect(() => {
    const newFilteredEmployeeList = employeeList.filter((employee) => {
      const matchingPosition = rosterPosition.find(
        (position) => position.position === employee.position
      );
      return matchingPosition && matchingPosition.count > 0;
    });

    setFilteredEmployeeList(newFilteredEmployeeList);
  }, [rosterPosition, employeeList]);

  useEffect(() => {
    setLoading((prev) => true);
    getNonConflictScheduleUser(
      scheduleDetailsState.company_id || 0,
      scheduleDetailsState.department_id || 0,
      scheduleDetailsState.start_date.toString(),
      scheduleDetailsState.end_date.toString()
    )
      .then((res) => {
        setEmployeeList(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, [scheduleDetailsState.start_date, scheduleDetailsState.end_date]);

  useEffect(() => {
    Promise.all([
      getSubscriptionModelByCompanyId(
        scheduleDetailsState.company_id || 0
      ).then((res) => {
        SetSubscription(res.data.type.toLowerCase().includes("premium"));
      }),
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,POSITION)`
      ).then((res) => {
        setCodeList(res.data);
      }),
    ]).finally(() => { });
  }, []);




  useEffect(() => {
    const newFilteredEmployeeList = employeeList.filter((employee) => {
      const matchingPosition = rosterPosition.find(
        (position) => position.position === employee.position
      );
      return matchingPosition && matchingPosition.count > 0;
    });

    setFilteredEmployeeList(newFilteredEmployeeList);
  }, [rosterPosition, employeeList]);

  const [employeePreferences, setEmployeePreferences] = useState<EmployeePreferences[]>([]);

  const setSchedulesToDefault = () => {
    setScheduleDetailsState((prev) => ({
      ...prev,
      employees: [],
      schedules: [],
    }));
  };

  const generateEmployeeList = () => {
    if (filteredEmployeeList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={2} className="text-center">
            No employees available
          </Table.Cell>
        </Table.Row>
      );
    }

    return filteredEmployeeList.map((emp, idx) => (
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
          <label>{codeList.find((c) => c.code === emp.position)?.description || emp.position}</label>
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
                      <label>{codeList.find((c) => c.code === emp.position)?.description || emp.position}</label>
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
  const [showEmployeeListModal, setShowEmployeeListModal] =
    React.useState(false);
  const employeeListModal = () => {
    return (
      <Modal
        show={showEmployeeListModal}
        onClose={() => setShowEmployeeListModal(false)}
      >
        <Modal.Header>Employee List</Modal.Header>
        <Modal.Body>
          <Label htmlFor="schedule-employees" value="Employees Available" />
          <div className="flex">
            <TextInput
              placeholder="Search Position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>
          {searchFilterEmployeeList.map((emp, idx) => (
            <div className="mt-3 grid grid-cols-5 flex" key={idx}>
              <Avatar
                size="md"
                img={emp.profile_image || ""}
                rounded
                style={{ display: "inline-block", margin: "0" }}
              />
              {emp.fullname}
              <div>{codeList.find((c) => c.code === emp.position)?.description || emp.position}</div>
              <div></div>
              {scheduleDetailsState.employees &&
                scheduleDetailsState.employees.some(
                  (employees) => employees.id === emp.id
                ) ? (
                <Button
                  color="failure"
                  size="sm"
                  onClick={() => handleAddOrRemoveEmployee(emp)}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  color="success"
                  size="sm"
                  onClick={() => handleAddOrRemoveEmployee(emp)}
                >
                  Add
                </Button>
              )}
            </div>
          ))}
        </Modal.Body>
      </Modal>
    );
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

  /*const autoAssignModal = () => {
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
  */

  const autoAssignPersonnel = () => {
    const newState: IRoster = {
      ...scheduleDetailsState,
      employees: [],
      schedules: [],
    };
  
    let start_day: string;
  
    if (scheduleDetailsState.start_date.getDay() == 0) start_day = "SUN";
    if (scheduleDetailsState.start_date.getDay() == 1) start_day = "MON";
    if (scheduleDetailsState.start_date.getDay() == 2) start_day = "TUE";
    if (scheduleDetailsState.start_date.getDay() == 3) start_day = "WED";
    if (scheduleDetailsState.start_date.getDay() == 4) start_day = "THUR";
    if (scheduleDetailsState.start_date.getDay() == 5) start_day = "FRI";
    if (scheduleDetailsState.start_date.getDay() == 6) start_day = "SAT";
  
    scheduleDetailsState.positions?.forEach((pos) => {
      const selectedCount = pos.count;
      const availableEmployees: IUser[] = filteredEmployeeList.filter(
        (emp) => emp.position === pos.position
      );
      const updatedSchedules: IUserSchedule[] = [];
  
      if (availableEmployees.length > 0 && selectedCount > 0) {
        const selectedEmployees: IUser[] = [];
        const candidatesWithStartDayPref: IUser[] = availableEmployees.filter(
          (emp) => emp.preferences?.[0]?.preference?.split(',').includes(start_day)
        );
  
        // Select employees with start_day preference
        candidatesWithStartDayPref.forEach((candidate) => {
          if (selectedEmployees.length < selectedCount) {
            const shiftPref = candidate.preferences?.[1]?.preference?.split(',');
            const shift =
              shiftPref && shiftPref.length > 0
                ? shiftPref[Math.floor(Math.random() * shiftPref.length)]
                : "FULL";
  
            selectedEmployees.push(candidate);
            updatedSchedules.push({
              user_id: candidate.id,
              user_company_id: candidate.company_id,
              start_date: newState.start_date,
              end_date: newState.end_date,
              shift: shift || "FULL",
              status: "",
              created_by: globalState?.user?.fullname || "",
              updated_by: globalState?.user?.fullname || "",
            });
          }
        });
  
        // Fill remaining slots with random candidates
        for (let i = selectedEmployees.length; i < selectedCount; i++) {
          if (availableEmployees.length === 0) {
            break; // If no more candidates are available, break the loop
          }
          const filteredAvailableEmployees = availableEmployees.filter(
            (emp) => !selectedEmployees.includes(emp)
          );
          const randomIndex = Math.floor(Math.random() * filteredAvailableEmployees.length);
          const randomCandidate: IUser = filteredAvailableEmployees.splice(randomIndex, 1)[0];
          const shiftPref = randomCandidate.preferences?.[1]?.preference?.split(',');
          const shift =
            shiftPref && shiftPref.length > 0
              ? shiftPref[Math.floor(Math.random() * shiftPref.length)]
              : "FULL";
  
          selectedEmployees.push(randomCandidate);
          updatedSchedules.push({
            user_id: randomCandidate.id,
            user_company_id: randomCandidate.company_id,
            start_date: newState.start_date,
            end_date: newState.end_date,
            shift: shift || "FULL",
            status: "",
            created_by: globalState?.user?.fullname || "",
            updated_by: globalState?.user?.fullname || "",
          });
        }
  
        newState.employees = [...(newState.employees ?? []), ...selectedEmployees];
        newState.schedules = [...(newState.schedules ?? []), ...updatedSchedules];
      }
    });
  
    // Update the state with the auto-assigned employees
    setScheduleDetailsState(newState);
  };

  console.log(scheduleDetailsState)
  
  /*const autoAssignPersonnelOld = (positionSelectedCount) => {
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
  };*/

  /*const useSelectedTemplate = (selectedTemplate: IRosterTemplate) => {
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
  */

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

  const modalProps = {
    createScheduleModal,
    setCreateScheduleModal,
    rosterPosition,
    setRosterPosition,
    rosterType,
    setRosterType,
    locationId,
    setLocationId,
    rosterSetting,
    setRosterSettings,
    filteredTemplateList,
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
              autoAssignPersonnel();
            }}
          >
            <p>Auto Assign</p>
            <HiUserGroup className="ml-2 my-auto" />
          </Button>
        </div>
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

          {/*filteredTemplateList.length > 0 && (
            <div style={{ marginLeft: "auto" }}>
              <Label htmlFor="employees-template" value="Template" />
              <Select
                onChange={(e) => {
                  const selectedTemplateName = e.target.value;
                  const selectedTemplateObject = filteredTemplateList.find(
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
                {filteredTemplateList.map((template, index) => (
                  <option key={index} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
                )*/}
        </div>

        <div className="mt-3 grid grid-cols-5 flex">
          <div className="col-span-1 border border-solid border-black p-2 mt-2 flex items-center justify-center">
            <p className="text-md">AM SHIFT</p>
          </div>
          <div className="col-span-4 border border-solid border-black p-2 mt-2 grid grid-cols-5 flex items-center justify-center gap-3">
            {scheduleDetailsState.employees?.map(
              (emp, idx) =>
                selectEmployeeShift(emp, "AM") && (
                  <div className="flex items-center justify-center" key={idx}>
                    <>
                      <Avatar size="md" img={emp.profile_image || ""} rounded />
                      <p>{emp.fullname}</p>
                      <Button
                        color="failure"
                        style={{ width: "15px", height: "15px" }}
                        onClick={() => handleAddOrRemoveEmployee(emp)}
                        size="sm"
                      >
                        <HiX />
                      </Button>
                    </>
                  </div>
                )
            )}
            <div className="flex items-center justify-center">
              <Button
                style={{ width: "50px" }}
                onClick={() => {
                  setShowEmployeeListModal(true);
                  setEmpShift("AM");
                }}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
          <div className="col-span-1 border border-solid border-black p-2 mt-2 flex items-center justify-center">
            <p className="text-md">PM SHIFT</p>
          </div>
          <div className="col-span-4 border border-solid border-black p-2 mt-2 grid grid-cols-5 flex items-center justify-center gap-3">
            {scheduleDetailsState.employees?.map(
              (emp, idx) =>
                selectEmployeeShift(emp, "PM") && (
                  <div className="flex items-center justify-center" key={idx}>
                    <>
                      <Avatar size="md" img={emp.profile_image || ""} rounded />
                      <p>{emp.fullname}</p>
                      <Button
                        color="failure"
                        style={{ width: "15px", height: "15px" }}
                        onClick={() => handleAddOrRemoveEmployee(emp)}
                        size="sm"
                      >
                        <HiX />
                      </Button>
                    </>
                  </div>
                )
            )}
            <div className="flex items-center justify-center">
              <Button
                style={{ width: "50px" }}
                onClick={() => {
                  setShowEmployeeListModal(true);
                  setEmpShift("PM");
                }}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
          <div className="col-span-1 border border-solid border-black p-2 mt-2 flex items-center justify-center">
            <p className="text-md">FULL SHIFT</p>
          </div>
          <div className="col-span-4 border border-solid border-black p-2 mt-2 grid grid-cols-5 flex items-center justify-center gap-3">
            {scheduleDetailsState.employees?.map(
              (emp, idx) =>
                selectEmployeeShift(emp, "FULL") && (
                  <div className="flex items-center justify-center" key={idx}>
                    <>
                      <Avatar size="md" img={emp.profile_image || ""} rounded />
                      <p>{emp.fullname}</p>
                      <Button
                        color="failure"
                        style={{ width: "15px", height: "15px" }}
                        onClick={() => handleAddOrRemoveEmployee(emp)}
                        size="sm"
                      >
                        <HiX />
                      </Button>
                    </>
                  </div>
                )
            )}
            <div className="flex items-center justify-center">
              <Button
                style={{ width: "50px" }}
                onClick={() => {
                  setShowEmployeeListModal(true);
                  setEmpShift("FULL");
                }}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/*
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

      <div>
        {/*autoAssignModal()*/}
        {submitModal()}
        {employeeListModal()}
        {<CreateScheduleModal {...modalProps} />}
      </div>
    </div>
  );
};

export default AddSchedule;

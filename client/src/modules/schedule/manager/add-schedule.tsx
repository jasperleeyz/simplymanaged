"use client";

import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import {
  Button,
  Checkbox,
  Label,
  Modal,
  Select,
  TextInput,
} from "flowbite-react";
import { HiUserGroup } from "react-icons/hi";
import React from "react";
import moment from "moment";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import IUser from "../../../shared/model/user.model";
import {
  EmployeeSchedule,
  ScheduleDetails,
} from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { toast } from "react-toastify";
import { capitalizeString } from "../../../configs/utils";

const AddSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const date: Date = location.state?.date;

  // TODO: can retrieve schedule templates from global state to populate dropdownlist
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  const [scheduleDetailsState, setScheduleDetailsState] =
    React.useState<ScheduleDetails>(() => {
      if (location.state?.schedule) {
        return location.state.schedule;
      } else {
        return {
          scheduleTemplate: "",
          date: date || new Date(),
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
    {
      id: 2,
      name: "JOHN WICK",
      email: "JOHNWICK@SIMPLYMANAGED.COM",
      phoneNo: "88888888",
      role: "E",
      position: "MANAGER",
      employmentType: "FULL-TIME",
    },
    {
      id: 3,
      name: "DEADPOOL",
      email: "DEADPOOL@SIMPLYMANAGED.COM",
      phoneNo: "77777777",
      role: "E",
      position: "BARISTA",
      employmentType: "PART-TIME",
    },
    {
      id: 4,
      name: "HARRY POTTER",
      email: "HARRYPOTTER@SIMPLYMANAGED.COM",
      phoneNo: "66666666",
      role: "E",
      position: "SERVER",
      employmentType: "PART-TIME",
    },
  ];

  const autoAssignPersonnel = () => {
    setShowModal(false);
    // TODO: to invoke API to fill schedule
    // API should be given selected date and template
    setScheduleDetailsState((prev) => ({
      ...prev,
      employeesSelected: [
        { ...employees[0], shift: "PM" },
        { ...employees[1], shift: "FULL" },
      ],
    }));
  };

  const updateEmployeeShift = (e, employee: EmployeeSchedule) => {
    const updatedArray = [...scheduleDetailsState.employeesSelected];
    updatedArray.forEach((emp) => {
      if (emp.id === employee.id) {
        emp.shift = e.target.value;
      }
    });
    setScheduleDetailsState((prev) => ({
      ...prev,
      employeesSelected: [...updatedArray],
    }));
  };

  const isEmpSelected = (employee: IUser) => {
    return (
      scheduleDetailsState.employeesSelected.find(
        (emp) => emp.id === employee.id
      ) !== undefined
    );
  };

  //  TODO: to invoke API to create schedule
  const createSchedule = () => {
    setGlobalState((prev) => ({
      ...prev,
      // TODO: add schedule to global state
      schedule: [...prev.schedule, scheduleDetailsState],
    }));

    toast.success("Schedule created successfully", { pauseOnHover: false });

    navigate(`/${PATHS.SCHEDULE}`, { replace: true });
  };

  return (
    <div>
      <p className="header">Create Schedule</p>
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
      <form>
        {/* Schedule Template/Type */}
        <div className="mb-3">
          <Label htmlFor="schedule-template" value="Template" />
          <Select
            id="schedule-template"
            value={scheduleDetailsState.scheduleTemplate}
            onChange={(e) =>
              setScheduleDetailsState((prev) => ({
                ...prev,
                scheduleTemplate: e.target.value,
              }))
            }
            disabled
          >
            {/* TODO: populate templates  */}
          </Select>
          <div>
            <p>Employees needed: 2</p>
            <p></p>
          </div>
        </div>
        {/* Schedule Location */}
        <div className="mb-3">
          <Label htmlFor="schedule-location" value="Location" />
          <Select
            id="schedule-location"
            value={scheduleDetailsState.location}
            onChange={(e) => {
              setScheduleDetailsState((prev) => ({
                ...prev,
                location: e.target.value,
              }));
            }}
          >
            {globalState?.locations.map((l, idx) => (
              <option key={idx} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        {/* Schedule Date */}
        <div className="mb-3">
          <Label htmlFor="schedule-date" value="Date" />
          <TextInput
            id="schedule-date"
            type="date"
            min={moment(new Date()).format("yyyy-MM-DD")}
            value={moment(scheduleDetailsState.date).format("yyyy-MM-DD")}
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
                        setScheduleDetailsState((prev) => ({
                          ...prev,
                          employeesSelected: [...prev.employeesSelected, emp],
                        }));
                      } else {
                        setScheduleDetailsState((prev) => ({
                          ...prev,
                          employeesSelected: prev.employeesSelected.filter(
                            (_, i) => {
                              return _.id !== emp.id;
                            }
                          ),
                        }));
                      }
                    }}
                  />
                  <Label
                    className="ml-3 underline underline-offset-2 "
                    onClick={() => {
                      setShowEmpProps((prev) => ({ show: true, emp: emp }));
                    }}
                  >
                    {capitalizeString(emp.name)}
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
            {scheduleDetailsState.employeesSelected.map((emp, idx) => {
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
              <Details
                id="emp-name"
                labelValue={"Name"}
                value={capitalizeString(showEmpProps.emp?.name)}
              />
              <Details
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

const Details = ({ id, labelValue, value }: any) => {
  return (
    <div className="block">
      <Label htmlFor={id}>{labelValue}</Label>
      <p id={id}>{value}</p>
    </div>
  );
};

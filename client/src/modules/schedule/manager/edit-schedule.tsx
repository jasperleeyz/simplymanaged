import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import {
  Button,
  Label,
  Modal,
  TextInput,
  CustomFlowbiteTheme,
  Avatar,
} from "flowbite-react";
import { HiX } from "react-icons/hi";
import React from "react";
import moment from "moment";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import IUser from "../../../shared/model/user.model";
import {  IRoster } from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { toast } from "react-toastify";
import {
  getNonConflictScheduleUserRoster,
} from "../../../shared/api/user-schedule.api";
import {
  updateRoster,
} from "../../../shared/api/roster.api";
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
  const [empShift, setEmpShift] = React.useState("FULL"); 
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

  useEffect(() => {
    const newFilteredEmployeeList = employeeList.filter((employee) => {
      const matchingPosition = scheduleDetailsState.positions?.find(
        (position) => position.position === employee.position
      );
      return matchingPosition && matchingPosition.count > 0;
    });

    setFilteredEmployeeList(newFilteredEmployeeList);
  }, [scheduleDetailsState, employeeList]);
  
  const [searchFilterEmployeeList, setSearchFilterEmployeeList] = useState<IUser[]>([]);

  const [maxEmployee, setMaxEmployee] = React.useState(false);

  useEffect(() => {
    if (scheduleDetailsState.positions) {
      scheduleDetailsState.positions.forEach((pos) => {
        const maxCount = pos.count;

        if (scheduleDetailsState.employees) {
          const currentCount = scheduleDetailsState.employees.filter(
            (emp) => emp.position === pos.position
          ).length;

          if (currentCount >= maxCount) {
            setMaxEmployee(true);
          } else {
            setMaxEmployee(false);
          }
        }
      });
    }
  }, [scheduleDetailsState.employees, scheduleDetailsState.positions]);

  useEffect(() => {
    // When the searchTerm changes, update the filteredEmployees state.
    const filtered = filteredEmployeeList.filter((emp) =>
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchFilterEmployeeList(filtered);
  }, [searchTerm, filteredEmployeeList]);

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
  console.log(scheduleDetailsState)
  useEffect(() => {
    setLoading((prev) => true);
    getNonConflictScheduleUserRoster(
      scheduleDetailsState.company_id || 0,
      scheduleDetailsState.department_id || 0,
      scheduleDetailsState.id || 0,
      scheduleDetailsState.start_date.toString(),
      scheduleDetailsState.end_date.toString(),
    )
      .then((res) => {
        setEmployeeList(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, [
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

  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);

  useEffect(() => {
    Promise.all([
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,POSITION)`
      ).then((res) => {
        setCodeList(res.data);
      })
    ])
  }, []);

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
              <div>{codeList.find((c) => c.code === emp.position)?.description ||
                  emp.position}</div>
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
            {!maxEmployee ? (
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
              ) : 
              null}
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
            {!maxEmployee ? (
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
              ) : 
              null}
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
            {!maxEmployee ? (
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
              ) : 
              null}
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
      <div>{submitModal()}
      {employeeListModal()}</div>
    </div>
  );
};

export default EditSchedule;

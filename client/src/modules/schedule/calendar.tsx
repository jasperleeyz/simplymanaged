"use client";
import { useContext, useState, useEffect } from "react";
import {
  Button,
  CustomFlowbiteTheme,
  Flowbite,
  Label,
  Select,
  Modal,
  TextInput,
  Checkbox,
} from "flowbite-react";
import React from "react";
import { MONTHS, PATHS, ROLES } from "../../configs/constants";
import CalendarMonthView from "../../shared/layout/calendar/calendar-month-view";
import { HiCalendar, HiDocument, HiTemplate } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { GlobalStateContext } from "../../configs/global-state-provider";
import {
  IUserSchedule,
  IRoster,
  IRosterTemplate,
  IRosterTemplatePosition,
} from "../../shared/model/schedule.model";
import { getAllUserSchedule } from "../../shared/api/user-schedule.api";
import { getAllEmployees } from "../../shared/api/user.api";
import { getAllLocations } from "../../shared/api/location.api";
import { ICompanyLocation } from "../../shared/model/company.model";
import IUser from "../../shared/model/user.model";
import {
  getRosterTemplate,
  getRosterTemplatePosition,
  createRosterTemplate,
  deleteRosterTemplate,
} from "../../shared/api/roster.api";
import { toast } from "react-toastify";

const customCalendarStyle: CustomFlowbiteTheme = {
  buttonGroup: {
    position: {
      none: "focus:ring-2",
      start: "rounded-b-none",
      middle: "rounded-b-none border-l-0 pl-0",
      end: "rounded-b-none border-l-0 pl-0",
    },
  },
};

const Calendar = () => {
  const navigate = useNavigate();
  const { globalState } = useContext(GlobalStateContext);

  // TODO: to call retrieve schedule api here
  const [locationList, setLocationList] = useState<ICompanyLocation[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    setLoadingLocation((prev) => true);
    getAllLocations(globalState?.user?.company_id || 0)
      .then((res) => {
        setLocationList(res.data);
      })
      .finally(() => {
        setLoadingLocation((prev) => false);
      });
  }, []);

  const scheduleList =
    React.useContext(GlobalStateContext).globalState?.schedule;

  // TODO: update with default values
  const [schedule, setSchedule] = React.useState([]);
  const [dateRange, setDateRange] = React.useState({
    start: new Date().getDate(),
    end: new Date().getDate() + 7,
  });
  const [location, setLocation] = React.useState(() => {
    const l = history.state["scheduleLocation"];
    if (!l) return locationList[0];
    return l;
  });
  const [month, setMonth] = React.useState(() => {
    const m = history.state["scheduleMonth"];
    if (!m) return new Date().getMonth();
    return m;
  });
  const [year, setYear] = React.useState(() => {
    const y = history.state["scheduleYear"];
    if (!y) return new Date().getFullYear();
    return y;
  });
  const [isPersonal, setIsPersonal] = React.useState(() => {
    if (globalState?.user?.role === ROLES.EMPLOYEE) return true;
    const ip = history.state["isPersonal"];
    if (!ip) return false;
    return ip;
  });

  const [loadingUserSchedule, setLoadingUserSchedule] = useState(true);

  useEffect(() => {
    setLoadingUserSchedule((prev) => true);
    getAllUserSchedule(0, month + 1, year)
      .then((res) => {
        console.log(res.data);
      })
      .finally(() => {
        setLoadingUserSchedule((prev) => false);
      });
  }, [month, year]);

  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );

  // TODO: retrigger schedule retrieval when control values changed by user
  React.useEffect(() => {
    // api call to retrieve schedule

    // store new values to history state
    history.replaceState(
      {
        scheduleMonth: month,
        scheduleYear: year,
        scheduleLocation: location,
        isPersonal: isPersonal,
      },
      ""
    );
  }, [dateRange, location, month, year, isPersonal]);

  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] =
    React.useState(false);

  const templateModal = () => {
    const [templateList, setTemplateList] = useState<IRosterTemplate[]>([]);
    const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);
    useEffect(() => {
      //setLoading((prev) => true);
      getRosterTemplate(globalState?.user?.company_id || 0)
        .then((res) => {
          setTemplateList(res.data);
        })
        .finally(() => {
          //  setLoading((prev) => false);
        });
    }, [showTemplateModal, confirmationModal]);

    const [selectedTemplate, setSelectedTemplate] = useState<IRosterTemplate>();
    useEffect(() => {
      setSelectedTemplate(templateList[0]);
    }, [templateList]);

    const [templatePositions, setTemplatePositions] = useState<{
      [key: string]: number;
    }>({});
    useEffect(() => {
      //setLoading((prev) => true);
      getRosterTemplatePosition(
        selectedTemplate?.company_id || 0,
        selectedTemplate?.id || 0
      )
        .then((res) => {
          const templatePosition = {};
          res.data.forEach((item) => {
            templatePosition[item.position] = item.count;
            setTemplatePositions(templatePosition);
          });
        })
        .finally(() => {
          //setLoading((prev) => false);
        });
    }, [selectedTemplate]);
    
    return (
      <div>
      <Modal
        show={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      >
        <Modal.Header>Roster Template</Modal.Header>
        <Modal.Body>
          <Label className="text-l" value="Template Name" />
          <div className="flex my-2">
            <Select
              onChange={(e) => {
                const selectedTemplateName = e.target.value;
                const selectedTemplateObject = templateList.find(
                  (template) => template.name === selectedTemplateName
                );
                setSelectedTemplate(selectedTemplateObject);
              }}
            >
              {templateList.map((template, index) => (
                <option key={index} value={template.name}>
                  {template.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <p>
              {selectedTemplate && (
                <div>
                  <Label
                    className="my-2 text-l"
                    value="Template Details"
                  ></Label>
                <div>
                  <span>
                  Shift Type - {selectedTemplate.roster_type} 
                    {Object.keys(templatePositions).map((position, index) => (
                      <div key={index}>
                        {position} - {templatePositions[position]}
                      </div>
                    ))}
                    No of Employees - {selectedTemplate.no_of_employees}
                  </span>
                  </div>
                </div>
              )}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-between items-center">
            <Button
              color="success"
              className="w-1/4" // Adjust the width as needed
              size="sm"
              onClick={() => {
                setShowCreateTemplateModal(true);
                setShowTemplateModal(false);
              }}
            >
              Create
            </Button>
            <div className="flex-1"></div>{" "}
            {/* Flex to push the "Use" button to the right */}
            <Button
              color="failure"
              className="w-1/4" // Adjust the width as needed
              size="sm"
              onClick={() => {
                setShowConfirmationModal(true);
              }}
            >
              Delete
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
        <Modal.Header>Confirmation</Modal.Header>
        <Modal.Body>
          <div>
            <p>Delete {selectedTemplate?.name} ?</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex justify-center">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              onClick={() => {
                if(selectedTemplate){
                  deleteRosterTemplate(selectedTemplate)
                  toast.success("Template delete successfully")
                  setShowConfirmationModal(false)
                }
            }}
            >
              Yes
            </Button>
            <Button
              color="failure"
              className="w-full"
              size="sm"
              onClick={() => setShowConfirmationModal(false)}
            >
              No
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      </div>
    );
  };

  const createTemplateModal = () => {
    const [templatePositions, setTemplatePositions] = useState<{
      [key: string]: number;
    }>({});
    const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);
    useEffect(() => {
      getAllEmployees()
        .then((res) => {
          const positionsArray = res.data.map((item) => item.position).flat();
          const templatePosition = positionsArray.reduce((acc, position) => {
            acc[position] = (acc[position] || 0) + 1;
            return acc;
          }, {});
          setTemplatePositions(templatePosition);
        })
        .finally(() => {});
    }, []);

    const [rosterTemplate, setRosterTemplate] = React.useState<IRosterTemplate>(
      {
        company_id: globalState?.user?.company_id || 0,
        roster_type: "",
        name: "",
        no_of_employees: 0,
        created_by: globalState?.user?.fullname || "",
        updated_by: globalState?.user?.fullname || "",
        positions: [],
      }
    );

    const [positionSelectedCount, setPositionSelectedCount] = React.useState(
      {}
    );

    useEffect(() => {
      const newPositions = Object.keys(positionSelectedCount).map(
        (position) => ({
          roster_template_id: 0,
          company_id: globalState?.user?.company_id || 0,
          position: position,
          count: positionSelectedCount[position],
        })
      );

      setRosterTemplate((prevTemplate) => ({
        ...prevTemplate,
        positions: newPositions,
      }));
    }, [positionSelectedCount]);

    const [selectedPosition, setSelectedPosition] = useState("");

    useEffect(() => {
      setSelectedPosition(Object.keys(templatePositions)[0]);
    }, [templatePositions]);

    const incrementSelectedCount = (position) => {
      const currentCount = positionSelectedCount[position] || 0;
      const limit = templatePositions[position] || 0; // Get the position count limit
      if (currentCount < limit) {
        setPositionSelectedCount((prevPositionSelectedCount) => ({
          ...prevPositionSelectedCount,
          [position]: currentCount + 1,
        }));
        setRosterTemplate((prevTemplate) => ({
          ...prevTemplate,
          no_of_employees: prevTemplate.no_of_employees + 1,
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
        setRosterTemplate((prevTemplate) => ({
          ...prevTemplate,
          no_of_employees: prevTemplate.no_of_employees - 1,
        }));
      }
    };

    return (
      <div>
      <Modal
        show={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
      >
        <Modal.Header>Create Roster Template</Modal.Header>
        <Modal.Body>
          <Label className="my-2 text-l" value="Template Position"></Label>
          <div className="flex my-2">
            <Select onChange={(e) => setSelectedPosition(e.target.value)}>
              {Object.keys(templatePositions).map((position, index) => (
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
          {rosterTemplate.no_of_employees > 0 ? (
            <div className="my-2">
              <Label
                className="text-l"
                htmlFor="template-details"
                value="Template Details"
              />
              {Object.keys(positionSelectedCount).map((position, index) => (
                <div className="my-2" key={index}>
                  {position} - {positionSelectedCount[position]}
                </div>
              ))}
              No of Employees -  {rosterTemplate.no_of_employees}
            </div>
          ) : null}
          <div className="my-2">
            <Label
              className="mr-2 text-l"
              htmlFor="shift-template"
              value="Shfit-Based"
            />
            <Checkbox value={rosterTemplate.roster_type} 
            checked={rosterTemplate.roster_type == 'SHIFT'} 
            onChange={() => {
              if(rosterTemplate.roster_type == 'SHIFT')
                { setRosterTemplate((prevTemplate) => ({
                  ...prevTemplate,
                  roster_type: 'PROJECT',
                }));}
              else{
                setRosterTemplate((prevTemplate) => ({
                  ...prevTemplate,
                  roster_type: 'SHIFT',
                }));
              }
            }} />
          </div>
          <div>
            <Label
              className="text-l"
              htmlFor="create-template"
              value="Template Name"
            />
            <TextInput
              style={{ width: "150px" }}
              maxLength={10}
              autoComplete="off"
              onChange={(e) => {
                setRosterTemplate((prevTemplate) => ({
                  ...prevTemplate,
                  name: e.target.value,
                }));
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="ml-auto">
            <Button
              color="success"
              size="sm"
              onClick={() => {
                setShowConfirmationModal(true)
              }}
            >
              Create
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
      <Modal.Header>Confirmation</Modal.Header>
      <Modal.Body>
        <div>
          <p>Create {rosterTemplate?.name} ?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="w-full md:w-1/2 ms-auto flex justify-center">
          <Button
            color="success"
            className="w-full mr-3"
            size="sm"
            onClick={() => {
              if(rosterTemplate){
                createRosterTemplate(rosterTemplate)
                toast.success("Template create successfully")
                setShowConfirmationModal(false)
                setShowCreateTemplateModal(false)
              }
          }}
          >
            Yes
          </Button>
          <Button
            color="failure"
            className="w-full"
            size="sm"
            onClick={() => setShowConfirmationModal(false)}
          >
            No
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
    </div>
    );
  };

  const confirmationModal = () => {
    return (
      <div></div>
    );
  };


  return (
    <Flowbite theme={{ theme: customCalendarStyle }}>
      <div id="schedule-main">
        <p className="header">{isPersonal ? "My Schedule" : "All Schedules"}</p>
        <div className="w-full mb-6 md:flex md:flex-wrap">
          <div className="grid grid-cols-2">
            <div>
              <Label htmlFor="month" value="Month" />
              <Select
                id="month"
                sizing="sm"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((l, idx) => (
                  <option key={idx} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="year" value="Year" />
              <Select
                id="year"
                sizing="sm"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {range(
                  new Date().getFullYear() - 1,
                  new Date().getFullYear() + 2,
                  1
                ).map((l, idx) => (
                  <option key={idx} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-3 md:mt-0 md:ms-24">
            {locationList.length > 0 ? (
              <>
                <Label htmlFor="location" value="Location" />
                <Select
                  id="location"
                  sizing="sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {locationList.map((l, idx) => (
                    <option key={idx} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </>
            ) : null}
          </div>
          {globalState?.user?.role === ROLES.MANAGER && (
            <div className="ms-auto mt-3 flex">
              <Button size="sm" onClick={() => setIsPersonal((prev) => !prev)}>
                {!isPersonal ? "View Personal Schedule" : "View All Schedules"}
              </Button>
              {!isPersonal && (
                <div className="flex">
                  <Button
                    size="sm"
                    onClick={() => setShowTemplateModal(true)}
                    className="ml-3"
                  >
                    <HiTemplate className="my-auto mr-2" />
                    <p>Roster Template</p>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`./${PATHS.CREATE_SCHEDULE}`)}
                    className="ml-3"
                  >
                    <HiCalendar className="my-auto mr-2" />
                    <p>Create Schedule</p>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <CalendarMonthView
          month={month}
          year={year}
          isPersonal={isPersonal}
          location={location}
        />
      </div>
      <div>
        {templateModal()}
        {createTemplateModal()}
        {confirmationModal()}
      </div>
    </Flowbite>
  );
};

export default Calendar;

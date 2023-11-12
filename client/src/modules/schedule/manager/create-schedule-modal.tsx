import React from "react";
import { useContext, useState, useEffect } from "react";
import {
  Button,
  Label,
  Select,
  Modal,
  Spinner,
  Checkbox,
} from "flowbite-react";
import { toast } from "react-toastify";
import { PATHS } from "../../../configs/constants";
import { useNavigate } from "react-router-dom";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { IRoster, IRosterTemplate, IRosterPosition } from "../../../shared/model/schedule.model";
import {
  getAllEmployees,
  getDepartmentAllEmployees,
} from "../../../shared/api/user.api";
import { getAllLocations } from "../../../shared/api/location.api";
import { ICompanyLocation } from "../../../shared/model/company.model";

type IProps = {
  createScheduleModal: boolean;
  setCreateScheduleModal: React.Dispatch<React.SetStateAction<boolean>>;
  rosterPosition: IRosterPosition[];
  setRosterPosition: React.Dispatch<React.SetStateAction<IRosterPosition[]>>;
  rosterType: string;
  setRosterType: React.Dispatch<React.SetStateAction<string>>;
  locationId: number;
  setLocationId: React.Dispatch<React.SetStateAction<number>>;
  rosterSetting: boolean;
  setRosterSettings: React.Dispatch<React.SetStateAction<boolean>>;
  filteredTemplateList: IRosterTemplate[];
};

const CreateScheduleModal = (props: IProps) => {
  const { globalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();
  const [positions, setPositions] = useState<{
    [key: string]: number;
  }>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);

  useEffect(() => {
    getDepartmentAllEmployees(globalState?.user?.department_id || 0)
      .then((res) => {
        const positionsArray = res.data.map((item) => item.position).flat();
        const templatePosition = positionsArray.reduce((acc, position) => {
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});
        setPositions(templatePosition);
      })
      .finally(() => {});
  }, [props.createScheduleModal]);

  const [locations, setLocations] = useState<ICompanyLocation[]>();

  useEffect(() => {
    getAllLocations(globalState?.user?.company_id || 0)
      .then((res) => {
        setLocations(res.data);
        props.setLocationId(Number(res.data[0].id));
      })
      .finally(() => {});
  }, [props.createScheduleModal]);

  const [positionSelectedCount, setPositionSelectedCount] = React.useState({});

  useEffect(() => {
    const newPositions = Object.keys(positionSelectedCount).map((position) => ({
      company_id: globalState?.user?.company_id || 0,
      position: position,
      count: positionSelectedCount[position],
    }));
    props.setRosterPosition(newPositions);
  }, [positionSelectedCount]);

  const [numOfEmployee, setNumOfEmployee] = useState(0);
  useEffect(() => {
    const totalCount = props.rosterPosition.reduce(
      (total, pos) => total + pos.count,
      0
    );
    setNumOfEmployee(totalCount);
  }, [numOfEmployee, props.rosterPosition]);

  const [selectedPosition, setSelectedPosition] = useState("");

  useEffect(() => {
    setSelectedPosition(Object.keys(positions)[0]);
  }, [positions]);

  const incrementSelectedCount = (position) => {
    const currentCount = positionSelectedCount[position] || 0;
    const limit = positions[position] || 0; // Get the position count limit
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

  const [submitLoading, setSubmitLoading] = React.useState(false);
  useEffect(() => {
    if (submitLoading) {
      /*createRosterTemplate().finally(()=>{
        toast.success("Template create successfully");
        setShowConfirmationModal(false);
        
      })*/
      props.setCreateScheduleModal((prev) => false);
      setSubmitLoading(false);
      setShowConfirmationModal(false);
    }
  }, [submitLoading]);

  return (
    <div>
      <Modal
        show={props.createScheduleModal}
        onClose={() => {
          props.setCreateScheduleModal((prev) => false);
          navigate(`/${PATHS.SCHEDULE}`, { replace: true });
        }}
      >
        <Modal.Header>Create Roster</Modal.Header>
        <Modal.Body>
          <Label className="my-2 text-l" value="Location"></Label>
          <div className="flex my-2">
            <Select
              onChange={(e) => props.setLocationId(Number(e.target.value))}
            >
              {locations?.map((loc, idx) => (
                <option key={idx} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </Select>
          </div>
          <Label className="my-2 text-l" value="Position"></Label>
          <div className="flex my-2">
            <Select onChange={(e) => setSelectedPosition(e.target.value)}>
              {Object.keys(positions).map((position, index) => (
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
                  <span style={{ fontSize: "20px" }}>-</span>
                </Button>
                <Button
                  style={{ marginLeft: "10px" }}
                  onClick={() => incrementSelectedCount(selectedPosition)}
                >
                  <span style={{ fontSize: "20px" }}>+</span>
                </Button>
              </div>
            ) : null}
          </div>
          {numOfEmployee > 0 ? (
            <div className="my-2">
              <Label
                className="text-l"
                htmlFor="template-details"
                value="Required Employees"
              />
              {Object.keys(positionSelectedCount).map((position, index) => (
                <div className="my-2" key={index}>
                  {positionSelectedCount[position] > 0 && (
                    <div>
                      {position} - {positionSelectedCount[position]}
                    </div>
                  )}
                </div>
              ))}
              No of Employees - {numOfEmployee}
            </div>
          ) : null}
          <div>
            <div className="my-2 flex">
              <div>
                <Label
                  className="mr-2 text-l"
                  htmlFor="shift-template"
                  value="Shift"
                />
                <Checkbox
                  className="flex w-10 h-10"
                  value={props.rosterType}
                  checked={props.rosterType == "SHIFT"}
                  onChange={() => {
                    if (props.rosterType == "SHIFT") {
                      props.setRosterType("PROJECT");
                    } else {
                      props.setRosterType("SHIFT");
                    }
                  }}
                />
              </div>
              <div className="mx-5">
                <Label
                  className="mr-2 text-l"
                  htmlFor="shift-template"
                  value="Project"
                />
                <Checkbox
                  className="flex w-10 h-10"
                  value={props.rosterType}
                  checked={props.rosterType == "PROJECT"}
                  onChange={() => {
                    if (props.rosterType == "SHIFT") {
                      props.setRosterType("PROJECT");
                    } else {
                      props.setRosterType("SHIFT");
                    }
                  }}
                />
              </div>
              {props.filteredTemplateList.length > 0 && (
            <div>
              <Label htmlFor="employees-template" value="Template" />
              <Select
                onChange={(e) => {
                  const selectedTemplateName = e.target.value;
                  const selectedTemplateObject = props.filteredTemplateList.find(
                    (template) => template.id === Number(selectedTemplateName)
                  );
                
                  if (selectedTemplateObject?.positions) {
                    selectedTemplateObject.positions.forEach((pos) => {
                      setPositionSelectedCount((prevPositionSelectedCount) => ({
                        ...prevPositionSelectedCount,
                        [pos.position]: pos.count,
                      }));
                    });
                    
                  }
                }}
              >
                <option value="-">-</option>
                {props.filteredTemplateList.map((template, index) => (
                  <option key={index} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="ml-auto">
            <Button
              color="success"
              size="sm"
              onClick={() => {
                setShowConfirmationModal(true);
              }}
            >
              Create
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
      >
        <Modal.Header>Confirmation</Modal.Header>
        <Modal.Body>
          <div>Create ?</div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex justify-center">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              disabled={submitLoading}
              onClick={() => {
                setSubmitLoading(true);
                props.setRosterSettings(false);
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

export default CreateScheduleModal;

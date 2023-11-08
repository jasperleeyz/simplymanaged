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
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { IRoster, IRosterPosition } from "../../../shared/model/schedule.model";
import { getAllEmployees } from "../../../shared/api/user.api";

type IProps = {
  createScheduleModal: boolean;
  setCreateScheduleModal: React.Dispatch<React.SetStateAction<boolean>>;
  rosterPosition:IRosterPosition[];
  setRosterPosition: React.Dispatch<React.SetStateAction<IRosterPosition[]>>;
};

const CreateScheduleModal = (props: IProps) => {
  const { globalState } = useContext(GlobalStateContext);
  const [positions, setPositions] = useState<{
    [key: string]: number;
  }>({});
  //const [schedulePosition, setSchedulePosition] = React.useState<IRosterPosition[]>([])
  const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);

  useEffect(() => {
    getAllEmployees(globalState?.user?.company_id || 0)
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

  const [positionSelectedCount, setPositionSelectedCount] = React.useState({});

  useEffect(() => {
    const newPositions = Object.keys(positionSelectedCount).map((position) => ({
      company_id: globalState?.user?.company_id || 0,
      position: position,
      count: positionSelectedCount[position],
    }));
    props.setRosterPosition(newPositions);
  }, [positionSelectedCount]);

  const [numOfEmployee, setNumOfEmployee] = useState(0)
  useEffect(() => {
    const totalCount = props.rosterPosition.reduce((total, pos) => total + pos.count, 0);
    console.log('Total Count:', totalCount);
    setNumOfEmployee(totalCount)
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
    if(submitLoading){
      /*createRosterTemplate().finally(()=>{
        toast.success("Template create successfully");
        setShowConfirmationModal(false);
        
      })*/
      props.setCreateScheduleModal((prev) => false);
      setSubmitLoading(false)
      setShowConfirmationModal(false);
    }
  }, [submitLoading]);
 
  return (
    <div>
      <Modal
        show={props.createScheduleModal}
        onClose={() => props.setCreateScheduleModal((prev) => false)}
      >
        <Modal.Header>Create Roster</Modal.Header>
        <Modal.Body>
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
                setSubmitLoading(true)
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

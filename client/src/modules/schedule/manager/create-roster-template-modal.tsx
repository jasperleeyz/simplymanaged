import React from "react";
import { useContext, useState, useEffect } from "react";
import {
  Button,
  Label,
  Select,
  Modal,
  TextInput,
  Checkbox,
} from "flowbite-react";
import { toast } from "react-toastify";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { IRosterTemplate } from "../../../shared/model/schedule.model";
import { getAllEmployees, getDepartmentAllEmployees } from "../../../shared/api/user.api";
import { createRosterTemplate } from "../../../shared/api/roster.api";
import { ICompanyCode } from "../../../shared/model/company.model";
import { getAllCompanyCodes } from "../../../shared/api/company-code.api";

type IProps = {
  createRosterTemplateModal: boolean;
  setCreateRosterTemplateModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateRosterTemplateModal = (props: IProps) => {
  const { globalState } = useContext(GlobalStateContext);
  const [templatePositions, setTemplatePositions] = useState<{
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
        setTemplatePositions(templatePosition);
      })
      .finally(() => {});
  }, [props.createRosterTemplateModal]);

  const [rosterTemplate, setRosterTemplate] = React.useState<IRosterTemplate>({
    company_id: globalState?.user?.company_id || 0,
    roster_type: "",
    name: "",
    no_of_employees: 0,
    created_by: globalState?.user?.fullname || "",
    updated_by: globalState?.user?.fullname || "",
    positions: [],
  });

  useEffect(() => {
    setRosterTemplate((prevTemplate) => ({
      ...prevTemplate,
      company_id: globalState?.user?.company_id || 0,
      roster_type: "PROJECT",
      name: "",
      no_of_employees: 0,
      created_by: globalState?.user?.fullname || "",
      updated_by: globalState?.user?.fullname || "",
      positions: [],
    }));
    setPositionSelectedCount([]);
  }, [props.createRosterTemplateModal]);

  const [positionSelectedCount, setPositionSelectedCount] = React.useState({});

  useEffect(() => {
    const newPositions = Object.keys(positionSelectedCount).map((position) => ({
      roster_template_id: 0,
      company_id: globalState?.user?.company_id || 0,
      position: position,
      count: positionSelectedCount[position],
    }));

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

  const [submitLoading, setSubmitLoading] = React.useState(false);
  useEffect(() => {
    if(submitLoading){
      createRosterTemplate(rosterTemplate).finally(()=>{
        toast.success("Template create successfully");
        setShowConfirmationModal(false);
        props.setCreateRosterTemplateModal((prev) => false);
      })
    }
  }, [submitLoading]);

  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);

  useEffect(() => {
    getAllCompanyCodes(
      globalState?.user?.company_id || 0,
      undefined,
      undefined,
      undefined,
      `equals(code_type,POSITION)`
    ).then((res) => {
      setCodeList(res.data);
    });
  }, []);

  return (
    <div>
      <Modal
        show={props.createRosterTemplateModal}
        onClose={() => props.setCreateRosterTemplateModal((prev) => false)}
      >
        <Modal.Header>Create Roster Template</Modal.Header>
        <Modal.Body>
          <Label className="my-2 text-l" value="Template Position"></Label>
          <div className="flex my-2">
            <Select onChange={(e) => setSelectedPosition(e.target.value)}>
              {Object.keys(templatePositions).map((position, index) => (
                <option key={index} value={position}>
                  {codeList.find((c) => c.code === position)?.description || position}
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
          {rosterTemplate.no_of_employees > 0 ? (
            <div className="my-2">
              <Label
                className="text-l"
                htmlFor="template-details"
                value="Template Details"
              />
              {Object.keys(positionSelectedCount).map((position, index) => (
                <div className="my-2" key={index}>
                  {positionSelectedCount[position] > 0 && (
                    <div>
                      {codeList.find((c) => c.code === position)?.description || position} - {positionSelectedCount[position]}
                    </div>
                  )}
                </div>
              ))}
              No of Employees - {rosterTemplate.no_of_employees}
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
              value={rosterTemplate.roster_type}
              checked={rosterTemplate.roster_type == "SHIFT"}
              onChange={() => {
                if (rosterTemplate.roster_type == "SHIFT") {
                  setRosterTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    roster_type: "PROJECT",
                  }));
                } else {
                  setRosterTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    roster_type: "SHIFT",
                  }));
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
              value={rosterTemplate.roster_type}
              checked={rosterTemplate.roster_type == "PROJECT"}
              onChange={() => {
                if (rosterTemplate.roster_type == "SHIFT") {
                  setRosterTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    roster_type: "PROJECT",
                  }));
                } else {
                  setRosterTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    roster_type: "SHIFT",
                  }));
                }
              }}
            />
            </div>
            </div>
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
          <div>Create {rosterTemplate?.name} ?</div>
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

export default CreateRosterTemplateModal;

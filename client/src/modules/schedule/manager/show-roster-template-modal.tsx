import React from "react";
import { useContext, useState, useEffect } from "react";
import { Button, Label, Select, Modal } from "flowbite-react";
import { toast } from "react-toastify";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { IRosterTemplate } from "../../../shared/model/schedule.model";
import {
  getRosterTemplate,
  getRosterTemplatePosition,
  deleteRosterTemplate,
} from "../../../shared/api/roster.api";
import CreateRosterTemplateModal from "../../../modules/schedule/manager/create-roster-template-modal";


type IProps = {
  showRosterTemplateModal: boolean;
  setShowRosterTemplateModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const ShowRosterTemplateModal = (props: IProps) => {
  const { globalState } = useContext(GlobalStateContext);
  const [templateList, setTemplateList] = useState<IRosterTemplate[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);
  useEffect(() => {
    getRosterTemplate(globalState?.user?.company_id || 0)
      .then((res) => {
        setTemplateList(res.data);
      })
      .finally(() => {
      });
  }, [props.showRosterTemplateModal]);

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

  const [createRosterTemplateModal, setCreateRosterTemplateModal] = React.useState(false);
  const modalProps = { createRosterTemplateModal, setCreateRosterTemplateModal };

  return (
    <div>
      <Modal
        show={props.showRosterTemplateModal}
        onClose={() => props.setShowRosterTemplateModal((prev) => false)}
      >
        <Modal.Header>Roster Template</Modal.Header>
        <Modal.Body>
          <Label className="text-l" value="Template Name" />
          <div className="flex my-2">
            {templateList.length > 0 ? (
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
            ) : (
              <p>No roster template available</p>
            )}
          </div>
          <div>
            {selectedTemplate && (
              <div>
                <Label className="my-2 text-l" value="Template Details"></Label>
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full flex justify-between items-center">
            <Button
              color="success"
              className="w-1/4" // Adjust the width as needed
              size="sm"
              onClick={() => {
                setCreateRosterTemplateModal(true);
                props.setShowRosterTemplateModal((prev) => false);
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
              disabled={templateList.length === 0}
              onClick={() => {
                setShowConfirmationModal(true);
              }}
            >
              Delete
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
          <div>Delete {selectedTemplate?.name} ?</div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex justify-center">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              onClick={() => {
                if (selectedTemplate) {
                  deleteRosterTemplate(selectedTemplate);
                  toast.success("Template delete successfully");
                  setShowConfirmationModal(false);
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
      {<CreateRosterTemplateModal {...modalProps} />}
    </div>
  );
};

export default ShowRosterTemplateModal;

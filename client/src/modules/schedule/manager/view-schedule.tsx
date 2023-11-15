import React from "react";
import { useEffect } from "react";
import { IRoster } from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import EditButton from "../../../shared/layout/buttons/edit-button";
import DeleteButton from "../../../shared/layout/buttons/delete-button";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { Avatar, Label, Modal, Button} from "flowbite-react";
import { capitalizeString } from "../../../configs/utils";
import { useNavigate } from "react-router-dom";
import { deleteRoster } from "../../../shared/api/roster.api";
import { toast } from "react-toastify";
import DeleteSchedulePrompt from "../../../modules/schedule/manager/delete-schedule-prompt";
import moment from "moment";
import { getAllCompanyCodes } from "../../../shared/api/company-code.api";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { ICompanyCode } from "../../../shared/model/company.model";

const ViewSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roster = location.state?.roster as IRoster[];
  const type = location.state?.type as string;
  const startDate = moment(new Date(roster[0].start_date));
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const [rosterToDelete, setRosterToDelete] = React.useState<IRoster | null>(
    null
  );
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);
  useEffect(() => {
    if (submitLoading && rosterToDelete) {
      deleteRoster(rosterToDelete).finally(() => {
        toast.success("Roster delete successfully");
        navigate(`/${PATHS.SCHEDULE}`, { replace: true });
        setRosterToDelete(null);
        setSubmitLoading(false);
      });
    }
  }, [submitLoading]);

  useEffect(() => {
    Promise.all([
      getAllCompanyCodes(
        user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,POSITION)`
      ).then((res) => {
        setCodeList(res.data);
      })
    ])
  }, []);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const deleteModal = () => {
    
    return (
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Confirmation</Modal.Header>
        <Modal.Body>
          <div>
            <p>Delete Roster?</p>
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
              onClick={() => setShowDeleteModal(false)}
              disabled={submitLoading}
            >
              No
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  const [openModal, setOpenModal] = React.useState(false);
  const modalProps = { openModal, setOpenModal };
  return (
    <div id="schedule-details-main">
      <p className="header">Schedule Details</p>
      <div>
        <LabeledField
          id="schedule-date"
          labelValue="Date"
          value={startDate.toDate().toLocaleDateString()}
        />
        <div>
          <Label htmlFor="schedule-employees" value="Scheduled Employees" />
          <div id="schedule-employees">
            {roster.map((rosteridx, idx) => (
              <div key={idx} className="mt-2">
                <div className="flex">
                  <p style={{ marginRight: "10px" }}>
                    Created by: {rosteridx.created_by}
                  </p>
                  <p style={{ marginRight: "10px" }}>
                    Start Date:{" "}
                    {new Date(rosteridx.start_date).toLocaleDateString()}
                  </p>
                  <p>
                    End Date:{" "}
                    {new Date(rosteridx.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="border border-solid border-black p-2 mt-2">
                  <p>{rosteridx.type}</p>
                  <div key={idx} className=" grid grid-cols-5 gap-4">
                    {rosteridx.schedules?.map((schedule, scheduleIdx) => (
                      <div key={`${idx}-${scheduleIdx}`}>
                        <Avatar
                          size="md"
                          img={schedule.user?.profile_image || ""}
                          rounded
                          style={{ display: "inline-block", margin: "0" }}
                        />
                        <p>{capitalizeString(schedule.user?.fullname || "")}</p>
                        <p>{capitalizeString(codeList.find((c) => c.code === schedule.user?.position)?.description || "")}</p>
                        <p>{schedule.shift} Shift</p>
                        <p>{schedule.user?.contact_no}</p>
                      </div>
                    ))}
                  </div>
                  {startDate.isSameOrAfter(moment(), "day") && (
                    <div
                      className="mt-4 flex"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <EditButton
                        size="sm"
                        style={{ marginRight: "10px" }}
                        onClick={() => {
                          navigate(
                            `/${PATHS.SCHEDULE}/${PATHS.EDIT_SCHEDULE}`,
                            {
                              state: { rosteridx },
                              replace: true,
                            }
                          );
                        }}
                      />
                      <DeleteButton
                        size="sm"
                        onClick={() => {
                          setRosterToDelete(rosteridx);
                          setShowDeleteModal(true)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {deleteModal()}
    </div>
  );
};

export default ViewSchedule;

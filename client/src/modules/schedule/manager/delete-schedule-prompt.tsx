"use client";

import React from "react";
import { Button, Modal } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import { ScheduleDetails } from "../../../shared/model/schedule.model";
import { GlobalStateContext } from "../../../configs/global-state-provider";

type IProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  schedule: ScheduleDetails | any;
};

const DeleteSchedulePrompt = (props: IProps) => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  // TODO: invoke delete API here
  const deleteSchedule = () => {
    setGlobalState((prev) => ({
      ...prev,
      schedule: prev.schedule.filter(
        (schedule) => schedule.date !== props.schedule.date
      ),
    }));
    props.setOpenModal((prev) => false);
  };

  return (
    <Modal
      show={props.openModal}
      size="md"
      popup
      dismissible
      onClose={() => props.setOpenModal((prev) => false)}
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiExclamationCircle className="mx-auto mb-4 text-5xl text-red-500" />
          <p>Are you sure you want to delete this schedule?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-center mx-auto gap-4">
          <Button color="failure" size="sm" onClick={() => deleteSchedule()}>
            Delete
          </Button>
          <Button
            color="gray"
            size="sm"
            onClick={() => props.setOpenModal((prev) => false)}
          >
            Cancel
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteSchedulePrompt;

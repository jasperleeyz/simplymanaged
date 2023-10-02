import { Button, ButtonProps, Modal } from "flowbite-react";
import React from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const BackButton = (props: ButtonProps) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
    <Button {...props} onClick={() => setShowModal(true)}>
      <HiArrowLeft className="mr-2 my-auto" />
      <p>Back</p>
    </Button>
    <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Discard data?</Modal.Header>
        <Modal.Body>
          <div>
            <p>
              Form data will be discarded upon leaving. Proceed?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full md:w-1/2 ms-auto flex justify-center">
            <Button
              color="success"
              className="w-full mr-3"
              size="sm"
              onClick={() => navigate(-1)}
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
    </>
  );
};

export default BackButton;

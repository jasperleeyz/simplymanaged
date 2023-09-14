import { Button, ButtonProps } from "flowbite-react";
import { HiX } from "react-icons/hi";

const RejectButton = (props: ButtonProps) => {

  return (
    <Button {...props} color="failure" onClick={props.onClick}>
      <HiX className="mr-2 my-auto" />
      <p>Reject</p>
    </Button>
  );
};

export default RejectButton;
import { Button, ButtonProps } from "flowbite-react";
import { HiCheck } from "react-icons/hi";

const ActivateButton = (props: ButtonProps) => {

  return (
    <Button {...props} color="success" onClick={props.onClick}>
      <HiCheck className="mr-2 my-auto" />
      <p>Activate</p>
    </Button>
  );
};

export default ActivateButton;
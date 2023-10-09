import { Button, ButtonProps } from "flowbite-react";
import { HiBan } from "react-icons/hi";

const DeactivateButton = (props: ButtonProps) => {

  return (
    <Button {...props} color="failure" onClick={props.onClick}>
      <HiBan className="mr-2 my-auto" />
      <p>Deactivate</p>
    </Button>
  );
};

export default DeactivateButton;
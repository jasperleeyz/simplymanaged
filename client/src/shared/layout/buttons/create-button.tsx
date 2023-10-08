import { Button, ButtonProps } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

const CreateButton = (props: ButtonProps) => {

  return (
    <Button {...props} onClick={props.onClick}>
      <HiPlus className="mr-2 my-auto" />
      <p>Create</p>
    </Button>
  );
};

export default CreateButton;
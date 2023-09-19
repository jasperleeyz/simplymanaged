import { Button, ButtonProps } from "flowbite-react";
import { HiPencil } from "react-icons/hi";

const EditButton = (props: ButtonProps) => {

  return (
    <Button {...props} onClick={props.onClick}>
      <HiPencil className="mr-2 my-auto" />
      <p>Edit</p>
    </Button>
  );
};

export default EditButton;
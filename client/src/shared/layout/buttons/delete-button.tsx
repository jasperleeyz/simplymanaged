import { Button, ButtonProps } from "flowbite-react";
import { HiTrash } from "react-icons/hi";

const DeleteButton = (props: ButtonProps) => {

  return (
    <Button {...props} color="failure" onClick={props.onClick}>
      <HiTrash className="mr-2 my-auto" />
      <p>Delete</p>
    </Button>
  );
};

export default DeleteButton;
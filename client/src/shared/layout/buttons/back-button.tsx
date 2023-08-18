import { Button, ButtonProps } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const BackButton = (props: ButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button {...props} onClick={() => navigate(-1)}>
      <HiArrowLeft className="mr-2 my-auto" />
      <p>Back</p>
    </Button>
  );
};

export default BackButton;

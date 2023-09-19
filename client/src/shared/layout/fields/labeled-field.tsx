import { Label } from "flowbite-react";

const LabeledField = ({ id, labelValue, value }: any) => {
  return (
    <div className="block">
      <Label htmlFor={id}>{labelValue}</Label>
      <p id={id}>{value}</p>
    </div>
  );
};

export default LabeledField;

"use client";

import { Label, Select, SelectProps } from "flowbite-react";

interface IProps extends SelectProps {
    labelValue: string;
}

const LabeledSelect = ({labelValue, children, ...props}: IProps) => {
    return (
        <div className="mb-2">
            <Label htmlFor={props.id} value={labelValue} />
            <Select {...props} >
                {children}
            </Select>
        </div>
    );
}

export default LabeledSelect;
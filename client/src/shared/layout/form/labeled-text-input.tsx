"use client";

import { Label, TextInput, TextInputProps } from "flowbite-react";

interface IProps extends TextInputProps {
    labelValue: string;
}

const LabeledInputText = ({labelValue, ...props}: IProps) => {
    return (
        <div className="mb-2">
            <Label htmlFor={props.id} value={labelValue} />
            <TextInput type="text" {...props} />
        </div>
    );
}

export default LabeledInputText;
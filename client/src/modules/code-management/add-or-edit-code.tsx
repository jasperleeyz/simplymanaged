"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import LabeledSelect from "../../shared/layout/form/labeled-select";

const CodeSchema = Yup.object().shape({
  codeType: Yup.string().required("Required"),
  code: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
});

const AddOrEditCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialValues = location?.state?.code
    ? location.state.code
    : {
        id: 0,
        codeType: "",
        code: "",
        description: "",
        status: "A",
      };

  return (
    <div>
      <p className="header">{`${
        location.pathname.endsWith(PATHS.EDIT_CODE) ? "Edit" : "Add"
      } Code`}</p>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {}}
        validationSchema={CodeSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <LabeledSelect 
                id="code-type" 
                name="codeType" 
                labelValue="Code Type"
                value={props.values.codeType}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.codeType && props.touched.codeType
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.codeType && props.touched.codeType ? (
                    <>{props.errors.codeType}</>
                  ) : null
                }
              >
                <option value="" />
                <option value="A">Active</option>
              </LabeledSelect>
              <LabeledTextInput 
                id="code" 
                name="code" 
                labelValue="Code" 
                value={props.values.code}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.code && props.touched.code
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.code && props.touched.code ? (
                    <>{props.errors.code}</>
                  ) : null
                }
              />
              <LabeledTextInput 
                id="description" 
                name="description" 
                labelValue="Description" 
                value={props.values.description}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.description && props.touched.description
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.description && props.touched.description ? (
                    <>{props.errors.description}</>
                  ) : null
                }
              />
            </div>
            <Button type="submit" size="sm" className="mt-12 ml-auto mr-0">
              Submit
            </Button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddOrEditCode;

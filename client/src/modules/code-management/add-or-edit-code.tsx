"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, TextInput } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import { toast } from "react-toastify";
import { capitalizeString } from "../../configs/utils";

const CodeSchema = Yup.object().shape({
  code_type: Yup.string().required("Field is required"),
  code_type_other: Yup.string().when("code_type", {
    is: (val) => val === "other",
    then: (schema) => schema.required("Field is required"),
  }),
  code: Yup.string().required("Field is required"),
  description: Yup.string().required("Field is required"),
});

const AddOrEditCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [codeTypeList, setCodeTypeList] = React.useState<any[]>([]);

  const initialValues = location?.state?.code
    ? location.state.code
    : {
        id: 0,
        code_type: "",
        code_type_other: "",
        code: "",
        description: "",
        status: "A",
      };

  const createOrUpdateCode = async (body: any) => {
    console.log(body);
    await fetch(`/code/create-update`, {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          // navigate(PATHS.VIEW_CODE);
          return Promise.resolve();
        } else {
          return res.text().then((data) => {
            return Promise.reject(data);
          });
        }
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  React.useEffect(() => {
    fetch("/code-type?size=10&page=1", {
      method: "GET",
    }).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (data) {
            setCodeTypeList(data.data);
          }
        });
      } else {
        toast.error("Error encountered. Please try again later");
      }
    });
  }, []);

  return (
    <div>
      <p className="header">{`${
        location.pathname.endsWith(PATHS.EDIT_CODE) ? "Edit" : "Add"
      } Code`}</p>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await createOrUpdateCode(values).then(() => {
              toast.success("Code created successfully");
              navigate(`..`);
            });
          } catch (err) {
            // toast.error(err); //TODO: either throw toast error or display error banner
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={CodeSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <LabeledSelect
                id="code-type"
                name="code_type"
                labelValue="Code Type"
                value={props.values.code_type}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.code_type && props.touched.code_type
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.code_type && props.touched.code_type ? (
                    <>{props.errors.code_type}</>
                  ) : null
                }
              >
                <option value="" />
                {codeTypeList.map((codeType, idx) => {
                  return (
                    <option key={idx} value={codeType.code_type}>
                      {codeType.code_type}
                    </option>
                  );
                })}
                <option value="other">Other</option>
              </LabeledSelect>
              {props.values.code_type === "other" ? (
                <TextInput
                  id="code-type-other"
                  name="code_type_other"
                  type="text"
                  value={props.values.code_type_other}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  color={
                    props.errors.code_type_other &&
                    props.touched.code_type_other
                      ? "failure"
                      : "gray"
                  }
                  placeholder="Define new code type here"
                  helperText={
                    props.errors.code_type_other &&
                    props.touched.code_type_other ? (
                      <>{props.errors.code_type_other}</>
                    ) : null
                  }
                />
              ) : null}
              <LabeledTextInput
                id="code"
                name="code"
                labelValue="Code"
                value={props.values.code}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.code && props.touched.code ? "failure" : "gray"
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
            <Button
              type="submit"
              size="sm"
              disabled={props.isSubmitting}
              isProcessing={props.isSubmitting}
              className="mt-12 ml-auto mr-0"
            >
              Submit
            </Button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddOrEditCode;

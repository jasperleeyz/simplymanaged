"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, TextInput } from "flowbite-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import { toast } from "react-toastify";
import { getAllCodeTypes } from "../../shared/api/code-type.api";
import { createUpdateCodes, getCodeById } from "../../shared/api/code.api";
import BackButton from "../../shared/layout/buttons/back-button";

const CodeSchema = Yup.object().shape({
  code_type: Yup.string().required("Field is required"),
  code_type_other: Yup.string().when("code_type", {
    is: (val) => val === "OTHER",
    then: (schema) => schema.matches(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscore are allowed").required("Field is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  code: Yup.string().matches(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscore are allowed").required("Field is required"),
  description: Yup.string().required("Field is required"),
});

const AddOrEditCode = () => {
  const navigate = useNavigate();

  const id = useParams()?.id;

  const [codeTypeList, setCodeTypeList] = React.useState<any[]>([]);

  const [initialValues, setInitialValues] = React.useState<any>({
    id: 0,
    code_type: "",
    code_type_other: "",
    code: "",
    description: "",
    status: "A",
  });

  React.useEffect(() => {
    getAllCodeTypes()
      .then((res) => {
        setCodeTypeList(res.data);
      })
      .catch((err) => {
        toast.error("Error encountered. Please try again later");
      });

    if (id) {
      getCodeById(Number(id))
        .then((res) => {
          setInitialValues(res.data);
        })
        .catch((err) => {
          toast.error(err, { toastId: id });
          navigate(`/${PATHS.CODE}`);
        });
    }
  }, []);

  return (
    <div>
      <p className="header">{`${!id ? "Add" : "Edit"} Code`}</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await createUpdateCodes(values).then(() => {
              toast.success(`Code ${!id ? "created" : "updated"} successfully`);
              navigate(`..`);
            });
          } catch (err) {
            toast.error(
              `Error ${
                !id ? "creating new" : "updating"
              } code. Please try again later.`
            );
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
                <option value="OTHER">Other</option>
              </LabeledSelect>
              {props.values.code_type === "OTHER" ? (
                <TextInput
                  id="code-type-other"
                  name="code_type_other"
                  type="text"
                  value={props.values.code_type_other?.toLocaleUpperCase()}
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
                value={props.values.code?.toLocaleUpperCase()}
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
                value={props.values.description?.toLocaleUpperCase()}
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
            <div className="flex justify-end mt-12 gap-3">
              <BackButton size="sm" color="light" />
              <Button
                type="submit"
                size="sm"
                disabled={props.isSubmitting}
                isProcessing={props.isSubmitting}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddOrEditCode;

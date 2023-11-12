"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, TextInput } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { CODE_TYPE, PATHS } from "../../configs/constants";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import { toast } from "react-toastify";
import BackButton from "../../shared/layout/buttons/back-button";
import {
  createUpdateCompanyCode,
  getAllCompanyCodeTypes,
  getAllCompanyCodes,
} from "../../shared/api/company-code.api";
import { GlobalStateContext } from "../../configs/global-state-provider";

const CodeSchema = Yup.object().shape({
  code_type: Yup.string().required("Field is required"),
  code_type_other: Yup.string().when("code_type", {
    is: (val) => val === "other",
    then: (schema) => schema.required("Field is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  code: Yup.string().required("Field is required"),
  description: Yup.string().required("Field is required"),
  leave_balance: Yup.number()
    .when("code_type", {
      is: (val) => val === CODE_TYPE.LEAVE_TYPE,
      then: (schema) => schema.min(1, "Leave balance must be greater than 0").required("Field is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const AddOrEditCompanyCode = () => {
  const navigate = useNavigate();
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;

  const id = useParams()?.id;

  const [codeTypeList, setCodeTypeList] = React.useState<any[]>([]);

  const [initialValues, setInitialValues] = React.useState<any>({
    id: 0,
    company_id: logged_in_user?.company_id || 0,
    code_type: "",
    code_type_other: "",
    code: "",
    description: "",
    status: "A",
    leave_balance: 0,
  });

  React.useEffect(() => {
    getAllCompanyCodeTypes(logged_in_user?.company_id || 0)
      .then((res) => {
        setCodeTypeList(res.data);
      })
      .catch((err) => {
        toast.error("Error encountered. Please try again later");
      });

    if (id) {
      getAllCompanyCodes(
        logged_in_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(id,${id})`
      )
        .then((res) => {
          setInitialValues(res.data[0]);
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
          console.log(values);
          setSubmitting(true);
          try {
            await createUpdateCompanyCode(values).then(() => {
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
                disabled={id ? true : false}
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
                {codeTypeList?.map((codeType, idx) => {
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
                disabled={id ? true : false}
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
              {props.values.code_type === CODE_TYPE.LEAVE_TYPE ? (
                <LabeledTextInput
                  id="leave-balance"
                  name="leave_balance"
                  labelValue="Leave Balance"
                  type={"number"}
                  value={props.values.leave_balance}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  color={
                    props.errors.leave_balance && props.touched.leave_balance
                      ? "failure"
                      : "gray"
                  }
                  helperText={
                    props.errors.leave_balance && props.touched.leave_balance ? (
                      <>{props.errors.leave_balance}</>
                    ) : null
                  }
                />
              ) : null}
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

export default AddOrEditCompanyCode;

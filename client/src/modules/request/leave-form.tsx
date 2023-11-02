import { Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import { Button, Label, Radio } from "flowbite-react";
import BackButton from "../../shared/layout/buttons/back-button";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { ICompanyCode } from "../../shared/model/company.model";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import { IRequest } from "../../shared/model/request.model";
import { create } from "domain";
import { createLeaveRequest } from "../../shared/api/request.api";

const validationSchema = Yup.object().shape({
  leave_type: Yup.string().required("Field is required"),
  start_date: Yup.date().required("Field is required"),
  end_date: Yup.date()
    .min(Yup.ref("start_date"), "End date must not be earlier than start date")
    .required("Field is required"),
});

const LeaveForm = () => {
  const user = React.useContext(GlobalStateContext)?.globalState?.user;
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = React.useState<any>({
    id: 0,
    leave_type: "",
    start_date: "",
    end_date: "",
    half_day: "NO",
    total_leave_days: 0,
    status: "P",
  });
  const [leaveBalance, setLeaveBalance] = React.useState(0);
  const [leaveTypeList, setLeaveTypeList] = React.useState<ICompanyCode[]>([]);

  const handleChangeForLeaveType = (e: any) => {
    // TODO: get leave balance
    const leaveType = e.target.value;

    // getPersonalLeaveBalanceByType(user?.company_id || 0, user?.id || 0, leaveType)
    //   .then((res) => {
    //     setLeaveBalance(res.data);
    //   })
    //   .catch((err) => {
    //     toast.error("Error encountered. Please try again later");
    //   });
  };

  const countNumberOfDays = (
    startDate: Date,
    endDate: Date,
    halfDay: string
  ) => {
    const diff = moment(endDate).diff(moment(startDate), "days");
    return diff + (diff === 0 && halfDay !== "NO" ? 0.5 : 1);
  };

  React.useEffect(() => {
    Promise.all([
      getAllCompanyCodes(
        user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,leave_type)`
      ).then((res) => {
        setLeaveTypeList(res.data);
      }),
    ]).catch((err) => {
      toast.error("Error encountered. Please try again later");
      navigate("..");
    });
  }, []);

  return (
    <div>
      <p className="header">Leave Application</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            values.total_leave_days = countNumberOfDays(
              values.start_date,
              values.end_date,
              values.half_day
            );
            await createLeaveRequest(
              user?.company_id || 0,
              user?.id || 0,
              values
            ).then(() => {
              toast.success(`Leave request created successfully`);
              navigate(`..`);
            });
          } catch (err) {
            toast.error("Error encountered. Please try again later");
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={validationSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div className="grid md:grid-cols-2 md:gap-x-6">
              <LabeledSelect
                id="leave-type"
                name="leave_type"
                labelValue="Leave Type"
                value={props.values.leave_type}
                onChange={(e) => {
                  handleChangeForLeaveType(e);
                  props.handleChange(e);
                }}
                onBlur={props.handleBlur}
                color={
                  props.errors.leave_type && props.touched.leave_type
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.leave_type && props.touched.leave_type ? (
                    <>{props.errors.leave_type}</>
                  ) : null
                }
              >
                <option value="">Select Leave Type</option>
                {leaveTypeList.map((leaveType, idx) => (
                  <option key={idx} value={leaveType.code}>
                    {leaveType.description}
                  </option>
                ))}
              </LabeledSelect>
              <LabeledField
                id="leave-type-balance"
                name="leave_type_balance"
                labelValue="Leave Balance"
                value={leaveBalance}
              />
              <LabeledTextInput
                id="start-date"
                name="start_date"
                labelValue="Start Date"
                type="date"
                value={props.values.start_date}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.start_date && props.touched.start_date
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.start_date && props.touched.start_date ? (
                    <>{props.errors.start_date}</>
                  ) : null
                }
              />
              <LabeledTextInput
                id="end-date"
                name="end_date"
                labelValue="End Date"
                type="date"
                value={props.values.end_date}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.end_date && props.touched.end_date
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.end_date && props.touched.end_date ? (
                    <>{props.errors.end_date}</>
                  ) : null
                }
              />
              {props.values["start_date"] &&
              props.values["end_date"] &&
              props.values["start_date"] === props.values["end_date"] ? (
                <div className="flex items-center gap-2">
                  {getHalfDayField(props)}
                </div>
              ) : null}
              {props.values["start_date"] &&
              props.values["end_date"] &&
              !(props.values["start_date"] > props.values["end_date"]) ? (
                <LabeledField
                  id="total-days"
                  name="total_days"
                  labelValue="Total No. of Leave(s) To Take"
                  value={countNumberOfDays(
                    props.values["start_date"],
                    props.values["end_date"],
                    props.values["half_day"]
                  )}
                />
              ) : null}
            </div>
            <div className="flex justify-end gap-3 mt-12">
              <BackButton size="sm" color="light" />
              <Button
                size="sm"
                type="submit"
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

const getHalfDayField = (formikProps: any) => (
  <fieldset className="flex max-w-md gap-4">
    <Label>Half day?</Label>
    <div className="flex items-center gap-2">
      <Radio
        id="no"
        name="half_day"
        value="NO"
        onChange={formikProps.handleChange}
        defaultChecked={
          formikProps.values["half_day"] === "NO" ||
          !formikProps.values["half_day"]
        }
      />
      <Label htmlFor="no">No</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio
        id="am"
        name="half_day"
        value="AM"
        onChange={formikProps.handleChange}
        defaultChecked={formikProps.values["half_day"] === "AM"}
      />
      <Label htmlFor="am">AM</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio
        id="pm"
        name="half_day"
        value="PM"
        onChange={formikProps.handleChange}
        defaultChecked={formikProps.values["half_day"] === "PM"}
      />
      <Label htmlFor="pm">PM</Label>
    </div>
  </fieldset>
);

export default LeaveForm;
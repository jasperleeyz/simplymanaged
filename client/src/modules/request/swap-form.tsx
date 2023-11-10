import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IUserSchedule } from "../../shared/model/schedule.model";
import {
  getAllUpcomingShiftSchedules,
  getAvailableShiftSchedulesForSwapping,
} from "../../shared/api/user-schedule.api";
import { Label, Textarea, Button } from "flowbite-react";
import { Formik } from "formik";
import BackButton from "../../shared/layout/buttons/back-button";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import * as Yup from "yup";
import { DATE } from "../../configs/constants";
import moment from "moment";
import { createSwapRequest } from "../../shared/api/request.api";

const validationSchema = Yup.object().shape({
  requester_schedule_id: Yup.string().required("Field is required"),
  requested_schedule_id: Yup.string().required("Field is required"),
  reason: Yup.string().required("Field is required"),
});

const SwapForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialValues, setInitialValues] = React.useState<any>({
    id: 0,
    requester_schedule_id: location.state?.schedule?.id || "",
    requested_schedule_id: "",
    reason: "",
  });
  const [upcomingShiftSchedules, setUpcomingShiftSchedules] = React.useState<
    IUserSchedule[]
  >([]);
  const [availableShiftScheduleForSwap, setAvailableShiftScheduleForSwap] =
    React.useState<IUserSchedule[]>([]);

  const handleRequesterScheduleChange = (e: any) => {
    const id = e.target.value;
    if (id !== "") {
      const selectedSchedule = upcomingShiftSchedules.find(
        (schedule) => schedule.id === Number(id)
      );
      console.log(selectedSchedule);
      getAvailableShiftSchedulesForSwapping(
        selectedSchedule?.shift,
        selectedSchedule?.start_date
      )
        .then((res) => {
          setAvailableShiftScheduleForSwap(res.data);
        })
        .catch((err) => {
          toast.error(err);
        });
    }
  };

  React.useEffect(() => {
    // retrieve list of shift schedules
    getAllUpcomingShiftSchedules()
      .then((res) => {
        if (res.data.length === 0) {
          toast.warn("You have no shifts available for swapping", {
            toastId: "swap-form",
          });
          navigate(-1);
        } else {
          setUpcomingShiftSchedules(res.data);
        }
      })
      .catch((err) => {
        toast.error("Error getting upcoming shift schedules", {
          toastId: "swap-form",
        });
      });

    if (location.state?.schedule) {
      const selectedSchedule = location.state?.schedule;
      getAvailableShiftSchedulesForSwapping(
        selectedSchedule?.shift,
        selectedSchedule?.start_date
      )
        .then((res) => {
          setAvailableShiftScheduleForSwap(res.data);
        })
        .catch((err) => {
          toast.error(err);
        });
    }
  }, []);

  return (
    <div>
      <p className="header">Shift Swap Request</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            const requested_user_id = availableShiftScheduleForSwap.find(
              (schedule) => schedule.id === Number(values.requested_schedule_id)
            )?.user_id;
            await createSwapRequest({ ...values, requested_user_id }).then(
              (res) => {
                toast.success("Swap request created successfully");
                navigate(-1);
              }
            );
          } catch (err) {
            toast.error(err as string);
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={validationSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <LabeledSelect
                id="personal-shift"
                name="requester_schedule_id"
                labelValue="Swap From"
                value={props.values.requester_schedule_id}
                onChange={(e) => {
                  handleRequesterScheduleChange(e);
                  props.handleChange(e);
                }}
                onBlur={props.handleBlur}
                color={
                  props.errors.requester_schedule_id &&
                  props.touched.requester_schedule_id
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.requester_schedule_id &&
                  props.touched.requester_schedule_id ? (
                    <>{props.errors.requester_schedule_id}</>
                  ) : null
                }
              >
                <option value={""}>Select schedule to swap</option>
                {upcomingShiftSchedules.map((schedule, idx) => (
                  <option key={idx} value={schedule.id}>
                    {`${moment(schedule.start_date).format(
                      DATE.MOMENT_DDMMYYYY
                    )} - ${schedule.shift} shift ${
                      schedule.roster?.location
                        ? `@ ${schedule.roster.location.name}`
                        : ""
                    }`}
                  </option>
                ))}
              </LabeledSelect>
              <LabeledSelect
                id="requested-shift"
                name="requested_schedule_id"
                labelValue="Swap To"
                value={props.values.requested_schedule_id}
                onChange={(e) => {
                  // handleScheduleChange(e);
                  props.handleChange(e);
                }}
                onBlur={props.handleBlur}
                color={
                  props.errors.requested_schedule_id &&
                  props.touched.requested_schedule_id
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.requested_schedule_id &&
                  props.touched.requested_schedule_id ? (
                    <>{props.errors.requested_schedule_id}</>
                  ) : null
                }
                disabled={
                  !availableShiftScheduleForSwap ||
                  availableShiftScheduleForSwap.length === 0
                }
              >
                <option value={""}>
                  {!availableShiftScheduleForSwap ||
                  availableShiftScheduleForSwap.length === 0
                    ? "No available schedule for swapping"
                    : "Select schedule to swap with"}
                </option>
                {availableShiftScheduleForSwap.map((schedule, idx) => (
                  <option key={idx} value={schedule.id}>
                    {`${moment(schedule.start_date).format(
                      DATE.MOMENT_DDMMYYYY
                    )} - ${schedule.shift} shift${
                      schedule.roster?.location
                        ? ` @ ${schedule.roster.location.name}`
                        : ""
                    }${schedule.user ? ` (${schedule.user.fullname})` : ""}`}
                  </option>
                ))}
              </LabeledSelect>
            </div>
            <div className="mb-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                value={props.values.reason}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.reason && props.touched.reason
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.reason && props.touched.reason ? (
                    <>{props.errors.reason}</>
                  ) : null
                }
              />
            </div>
            <div className="flex justify-end gap-3 mt-12">
              <BackButton
                size="sm"
                color="light"
                disabled={props.isSubmitting}
              />
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

export default SwapForm;
